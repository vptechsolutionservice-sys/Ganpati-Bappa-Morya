/**
 * RSVP Service — Full production implementation
 * Handles: submit, update, duplicate detection, host management, stats, export
 */

import { supabase } from './supabase';
import type { RSVP, RSVPStatus, RSVPStats, RSVPSettings } from '../types';

// ─── SESSION KEY ─────────────────────────────────────────────
// For open invitations (no guest token), use a browser-generated key
// stored in localStorage to identify returning visitors.
export function getOrCreateSessionKey(invitationId: string): string {
  const storageKey = `rsvp_sk_${invitationId}`;
  let key = localStorage.getItem(storageKey);
  if (!key) {
    key = `sk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(storageKey, key);
  }
  return key;
}

export function getSavedRsvpId(invitationId: string): string | null {
  return localStorage.getItem(`rsvp_id_${invitationId}`);
}

export function saveRsvpId(invitationId: string, rsvpId: string) {
  localStorage.setItem(`rsvp_id_${invitationId}`, rsvpId);
}

// ─── LOAD EXISTING RSVP ───────────────────────────────────────
export async function loadExistingRsvp(
  invitationId: string,
  guestToken?: string
): Promise<RSVP | null> {
  // 1. By guest token (personalized invitation)
  if (guestToken) {
    const { data } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitationId)
      .eq('guest_token', guestToken)
      .maybeSingle();
    if (data) return data as RSVP;
  }

  // 2. By saved RSVP ID in localStorage
  const savedId = getSavedRsvpId(invitationId);
  if (savedId) {
    const { data } = await supabase
      .from('rsvps')
      .select('*')
      .eq('id', savedId)
      .maybeSingle();
    if (data) return data as RSVP;
  }

  // 3. By session key
  const sessionKey = getOrCreateSessionKey(invitationId);
  const { data } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitationId)
    .eq('session_key', sessionKey)
    .maybeSingle();
  if (data) return data as RSVP;

  return null;
}

// ─── SUBMIT RSVP ─────────────────────────────────────────────
interface SubmitInput {
  invitationId: string;
  guestName: string;
  status: RSVPStatus;
  attendeeCount: number;
  message?: string;
  guestToken?: string;
}

export async function submitRSVP(
  input: SubmitInput
): Promise<{ rsvp: RSVP | null; error: string | null }> {
  const { invitationId, guestName, status, attendeeCount, message, guestToken } = input;

  // Check for existing RSVP first
  const existing = await loadExistingRsvp(invitationId, guestToken);
  if (existing) {
    // Update instead of insert
    return updateRSVP(existing.id, { guestName, status, attendeeCount, message });
  }

  const sessionKey = getOrCreateSessionKey(invitationId);

  const { data, error } = await supabase
    .from('rsvps')
    .insert({
      invitation_id: invitationId,
      guest_token: guestToken || null,
      session_key: guestToken ? null : sessionKey,
      guest_name: guestName.trim(),
      status,
      attendee_count: status === 'NOT_ATTENDING' ? 0 : Math.max(1, attendeeCount),
      message: message?.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    // Handle unique constraint violation (race condition)
    if (error.code === '23505') {
      const existing2 = await loadExistingRsvp(invitationId, guestToken);
      if (existing2) return updateRSVP(existing2.id, { guestName, status, attendeeCount, message });
    }
    return { rsvp: null, error: 'Could not submit RSVP. Please try again.' };
  }

  const rsvp = data as RSVP;
  saveRsvpId(invitationId, rsvp.id);
  return { rsvp, error: null };
}

// ─── UPDATE RSVP ─────────────────────────────────────────────
interface UpdateInput {
  guestName?: string;
  status: RSVPStatus;
  attendeeCount: number;
  message?: string;
}

export async function updateRSVP(
  rsvpId: string,
  input: UpdateInput
): Promise<{ rsvp: RSVP | null; error: string | null }> {
  const { guestName, status, attendeeCount, message } = input;

  const { data, error } = await supabase
    .from('rsvps')
    .update({
      ...(guestName ? { guest_name: guestName.trim() } : {}),
      status,
      attendee_count: status === 'NOT_ATTENDING' ? 0 : Math.max(0, attendeeCount),
      message: message?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rsvpId)
    .select('*')
    .single();

  if (error) return { rsvp: null, error: 'Could not update RSVP. Please try again.' };
  return { rsvp: data as RSVP, error: null };
}

// ─── RSVP STATS ──────────────────────────────────────────────
export async function getRSVPStats(invitationId: string): Promise<RSVPStats> {
  const { data, error } = await supabase.rpc('get_rsvp_stats', {
    invitation_uuid: invitationId,
  });

  if (error || !data) {
    return { coming_count: 0, maybe_count: 0, not_count: 0, total_count: 0, confirmed_people: 0, possible_people: 0 };
  }
  return data as RSVPStats;
}

// ─── HOST: LIST RSVPs ─────────────────────────────────────────
export type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'most_people' | 'fewest_people';

export async function getRSVPsForInvitation(
  invitationId: string,
  filter: RSVPStatus | 'ALL' = 'ALL',
  sort: SortOption = 'newest'
): Promise<RSVP[]> {
  let q = supabase.from('rsvps').select('*').eq('invitation_id', invitationId);
  if (filter !== 'ALL') q = q.eq('status', filter);

  const sortMap: Record<SortOption, { col: string; asc: boolean }> = {
    newest:       { col: 'created_at', asc: false },
    oldest:       { col: 'created_at', asc: true },
    name_asc:     { col: 'guest_name', asc: true },
    name_desc:    { col: 'guest_name', asc: false },
    most_people:  { col: 'attendee_count', asc: false },
    fewest_people:{ col: 'attendee_count', asc: true },
  };
  const s = sortMap[sort];
  q = q.order(s.col, { ascending: s.asc });

  const { data } = await q;
  return (data || []) as RSVP[];
}

// ─── HOST: DELETE RSVP ───────────────────────────────────────
export async function deleteRSVP(rsvpId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('rsvps').delete().eq('id', rsvpId);
  if (error) return { error: 'Could not delete RSVP.' };
  return { error: null };
}

// ─── RSVP SETTINGS ───────────────────────────────────────────
const DEFAULT_SETTINGS: RSVPSettings = {
  rsvp_enabled: true,
  rsvp_allow_maybe: true,
  rsvp_max_per_person: 10,
  rsvp_allow_message: true,
  rsvp_show_public_count: false,
  rsvp_deadline: null,
};

export function extractRSVPSettings(invitation: Record<string, any>): RSVPSettings {
  return {
    rsvp_enabled:          invitation.rsvp_enabled          ?? DEFAULT_SETTINGS.rsvp_enabled,
    rsvp_allow_maybe:      invitation.rsvp_allow_maybe       ?? DEFAULT_SETTINGS.rsvp_allow_maybe,
    rsvp_max_per_person:   invitation.rsvp_max_per_person    ?? DEFAULT_SETTINGS.rsvp_max_per_person,
    rsvp_allow_message:    invitation.rsvp_allow_message     ?? DEFAULT_SETTINGS.rsvp_allow_message,
    rsvp_show_public_count:invitation.rsvp_show_public_count ?? DEFAULT_SETTINGS.rsvp_show_public_count,
    rsvp_deadline:         invitation.rsvp_deadline          ?? DEFAULT_SETTINGS.rsvp_deadline,
  };
}

export async function updateRSVPSettings(
  invitationId: string,
  settings: Partial<RSVPSettings>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('invitations')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', invitationId);
  if (error) return { error: 'Could not save settings.' };
  return { error: null };
}

// ─── IS DEADLINE PASSED ──────────────────────────────────────
export function isDeadlinePassed(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

// ─── CSV EXPORT ──────────────────────────────────────────────
export function exportRSVPCsv(rsvps: RSVP[], invitationName: string) {
  const headers = ['Guest Name', 'Status', 'Attendee Count', 'Message', 'Submitted', 'Updated'];
  const rows = rsvps.map(r => [
    `"${r.guest_name}"`,
    r.status,
    r.status === 'NOT_ATTENDING' ? '0' : String(r.attendee_count),
    `"${(r.message || '').replace(/"/g, '""')}"`,
    new Date(r.created_at).toLocaleDateString('en-IN'),
    new Date(r.updated_at).toLocaleDateString('en-IN'),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsvp-${invitationName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── LABEL HELPERS ───────────────────────────────────────────
export const STATUS_LABELS: Record<RSVPStatus, { en: string; mr: string; icon: string; color: string }> = {
  COMING:        { en: "Yes, I'll Come",     mr: 'नक्की येणार!',          icon: '❤️', color: '#16a34a' },
  MAYBE:         { en: 'Maybe',              mr: 'कदाचित येऊ',            icon: '🤔', color: '#d97706' },
  NOT_ATTENDING: { en: "Sorry, I Can't Come",mr: 'यावेळी शक्य नाही',      icon: '😔', color: '#6b7280' },
};

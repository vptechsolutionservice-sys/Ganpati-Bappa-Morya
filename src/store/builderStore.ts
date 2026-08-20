import { type BuilderState } from '../types';
import { generateInvitationSlug } from '../lib/utils';

const STORAGE_KEY = 'ganpati_builder_draft';

export const defaultBuilderState: BuilderState = {
  invitation_type: 'family',
  host_name: '',
  family_name: '',
  city: '',
  address: '',
  landmark: '',
  mobile: '',
  family_photo_url: '',
  arrival_date: '',
  arrival_time: '10:00',
  sthapana_date: '',
  sthapana_time: '10:00',
  aarti_time: '20:00',
  prasad_time: '13:00',
  visarjan_date: '',
  visarjan_time: '18:00',
  duration_days: 1,
  maps_url: '',
  template_id: 'traditional',
  background: 'festive-gradient',
  theme: 'saffron',
  show_flowers: true,
  show_toran: true,
  show_diyas: true,
  show_rangoli: true,
  show_bells: true,
  show_particles: true,
  show_mandala: true,
  ganpati_image_url: '',
  message: `श्री गणेशाय नमः 🙏

गणपती बाप्पांच्या आगमनाने आमच्या घरी आनंदाचे आणि भक्तीचे वातावरण निर्माण झाले आहे.

या मंगलमय प्रसंगी आपण सहकुटुंब उपस्थित राहून बाप्पांचे दर्शन घ्यावे व आमचा आनंद द्विगुणित करावा, ही नम्र विनंती.

गणपती बाप्पा मोरया! 🙏`,
  guests: [],
  music_enabled: false,
  slug: '',
  family_story: '',
  currentStep: 1,
  isDirty: false,
  savedInvitationId: null,
};

export function saveDraftToStorage(state: BuilderState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadDraftFromStorage(): BuilderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BuilderState;
  } catch {
    return null;
  }
}

export function clearDraftFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateSlugFromState(state: BuilderState): string {
  const name = state.family_name || state.host_name;
  if (!name) return generateInvitationSlug('bappa');
  return generateInvitationSlug(name);
}

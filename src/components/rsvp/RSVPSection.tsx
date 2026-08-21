import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import {
  loadExistingRsvp,
  submitRSVP,
  updateRSVP,
  isDeadlinePassed,
  extractRSVPSettings,
  getRSVPStats,
  STATUS_LABELS,
} from '../../lib/rsvpService';
import type { RSVP, RSVPStatus, RSVPSettings, Invitation } from '../../types';
import { showToast } from '../ui/Toaster';

interface Props {
  invitation: Invitation;
  guestToken?: string;
  guestName?: string;
}

type Step = 'loading' | 'question' | 'form' | 'submitting' | 'done' | 'closed' | 'disabled';

export default function RSVPSection({ invitation, guestToken, guestName: initialGuestName }: Props) {
  const settings = extractRSVPSettings(invitation);
  const deadlinePassed = isDeadlinePassed(settings.rsvp_deadline);

  const [step, setStep] = useState<Step>('loading');
  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<RSVP | null>(null);

  // Form fields
  const [name, setName] = useState(initialGuestName || '');
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState('');

  // Public attendance count
  const [publicCount, setPublicCount] = useState<number | null>(null);

  useEffect(() => {
    init();
  }, [invitation.id, guestToken]);

  async function init() {
    // Check RSVP enabled
    if (!settings.rsvp_enabled) { setStep('disabled'); return; }
    if (deadlinePassed) { setStep('closed'); return; }

    // Load existing
    const existing = await loadExistingRsvp(invitation.id, guestToken);
    if (existing) {
      setExistingRsvp(existing);
      setSelectedStatus(existing.status);
      setName(existing.guest_name || '');
      setCount(existing.attendee_count || 1);
      setMessage(existing.message || '');
      setStep('done');
    } else {
      setStep('question');
    }

    // Public count
    if (settings.rsvp_show_public_count) {
      const stats = await getRSVPStats(invitation.id);
      setPublicCount(stats.confirmed_people);
    }
  }

  function selectResponse(status: RSVPStatus) {
    setSelectedStatus(status);
    if (status === 'NOT_ATTENDING') setCount(0);
    else if (count === 0) setCount(1);
    setStep('form');
  }

  function startEdit() {
    setStep('form');
  }

  function startChangeResponse() {
    setStep('question');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus || !name.trim()) {
      showToast('कृपया आपले नाव टाका', 'error');
      return;
    }

    setStep('submitting');

    if (existingRsvp) {
      const { rsvp, error } = await updateRSVP(existingRsvp.id, {
        guestName: name,
        status: selectedStatus,
        attendeeCount: selectedStatus === 'NOT_ATTENDING' ? 0 : count,
        message,
      });
      if (error) { showToast(error, 'error'); setStep('form'); return; }
      if (rsvp) setExistingRsvp(rsvp);
    } else {
      const { rsvp, error } = await submitRSVP({
        invitationId: invitation.id,
        guestName: name,
        status: selectedStatus,
        attendeeCount: selectedStatus === 'NOT_ATTENDING' ? 0 : count,
        message,
        guestToken,
      });
      if (error) { showToast(error, 'error'); setStep('form'); return; }
      if (rsvp) setExistingRsvp(rsvp);
    }

    setStep('done');
    showToast('RSVP saved! 🙏', 'success');
  }

  const maxPeople = settings.rsvp_max_per_person || 10;

  // ─── DISABLED ────────────────────────────────────────────
  if (step === 'disabled') {
    return (
      <div className="rounded-2xl p-6 text-center" style={{
        background: 'linear-gradient(135deg, rgba(255,115,0,0.06), rgba(192,57,43,0.04))',
        border: '1.5px solid rgba(255,115,0,0.2)',
      }}>
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-devanagari text-amber-700 text-sm">RSVP सध्या बंद आहे.</p>
        <p className="text-xs text-amber-500 mt-1">RSVP is currently closed.</p>
      </div>
    );
  }

  // ─── CLOSED (DEADLINE PASSED) ─────────────────────────────
  if (step === 'closed') {
    return (
      <div className="rounded-2xl p-6 text-center" style={{
        background: 'linear-gradient(135deg, rgba(255,115,0,0.06), rgba(192,57,43,0.04))',
        border: '1.5px solid rgba(255,115,0,0.2)',
      }}>
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>RSVP बंद झाले</p>
        <p className="text-xs text-amber-600">RSVP deadline has passed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 text-center" style={{
      background: 'linear-gradient(135deg, rgba(255,115,0,0.06), rgba(192,57,43,0.04))',
      border: '1.5px solid rgba(255,115,0,0.2)',
    }}>
      {/* Public count */}
      {publicCount !== null && publicCount > 0 && step !== 'form' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs text-amber-600 mb-4 font-devanagari">
          🙏 {publicCount} लोक सहभागी होत आहेत!
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {/* ─── LOADING ──────────────────────────────────────── */}
        {step === 'loading' && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-4">
            <div className="text-3xl animate-float">🙏</div>
          </motion.div>
        )}

        {/* ─── QUESTION ────────────────────────────────────── */}
        {step === 'question' && (
          <motion.div key="q" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-2xl mb-3">🙏</p>
            <h3 className="font-bold font-devanagari text-lg mb-2" style={{ color: '#3d1f00' }}>
              बाप्पांच्या दर्शनाला तुम्ही येणार का? ❤️
            </h3>
            <p className="text-xs text-amber-600 mb-6">Will you join us for Ganpati Darshan?</p>

            <div className="space-y-3">
              <button onClick={() => selectResponse('COMING')}
                className="w-full py-4 rounded-xl font-devanagari font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #27ae60, #1e8449)', boxShadow: '0 4px 15px rgba(39,174,96,0.3)' }}>
                ❤️ हो, आम्ही येणार!
              </button>

              {settings.rsvp_allow_maybe && (
                <button onClick={() => selectResponse('MAYBE')}
                  className="w-full py-4 rounded-xl font-devanagari font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #f39c12, #d68910)', boxShadow: '0 4px 15px rgba(243,156,18,0.3)' }}>
                  🤔 कदाचित येऊ
                </button>
              )}

              <button onClick={() => selectResponse('NOT_ATTENDING')}
                className="w-full py-4 rounded-xl font-devanagari font-semibold transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                😔 यावेळी शक्य नाही
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── FORM ────────────────────────────────────────── */}
        {step === 'form' && selectedStatus && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Status header */}
            <div className="mb-5">
              <span className="text-3xl">{STATUS_LABELS[selectedStatus].icon}</span>
              <p className="font-bold font-devanagari mt-2" style={{ color: STATUS_LABELS[selectedStatus].color }}>
                {STATUS_LABELS[selectedStatus].mr}
              </p>
              {selectedStatus === 'COMING' && (
                <p className="text-xs text-amber-600 mt-1">We're happy to welcome you! 🙏</p>
              )}
              {selectedStatus === 'MAYBE' && (
                <p className="text-xs text-amber-600 mt-1">We hope you can join us! 🙏</p>
              )}
              {selectedStatus === 'NOT_ATTENDING' && (
                <p className="text-xs text-amber-600 mt-1">We're sorry you can't make it. 🙏</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 font-devanagari" style={{ color: '#3d1f00' }}>
                  आपले नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="आपले नाव टाका..."
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-devanagari"
                  style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }}
                  onFocus={e => (e.target.style.borderColor = '#ff7300')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,160,23,0.4)')}
                />
              </div>

              {/* People counter — not for NOT_ATTENDING */}
              {selectedStatus !== 'NOT_ATTENDING' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 font-devanagari" style={{ color: '#3d1f00' }}>
                    किती जण {selectedStatus === 'COMING' ? 'येणार' : 'येऊ शकतात'}?
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button type="button"
                      onClick={() => setCount(Math.max(1, count - 1))}
                      disabled={count <= 1}
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:bg-amber-50 disabled:opacity-30"
                      style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#7a4c2a' }}>
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-4xl font-bold tabular-nums w-16 text-center" style={{ color: '#ff7300' }}>
                      {count}
                    </span>
                    <button type="button"
                      onClick={() => setCount(Math.min(maxPeople, count + 1))}
                      disabled={count >= maxPeople}
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:bg-amber-50 disabled:opacity-30"
                      style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#7a4c2a' }}>
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-500 text-center mt-1">
                    {selectedStatus === 'COMING' ? 'How many people are coming?' : 'How many people might attend?'}
                  </p>
                </div>
              )}

              {/* Message */}
              {settings.rsvp_allow_message && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 font-devanagari" style={{ color: '#3d1f00' }}>
                    संदेश <span className="text-amber-400 text-xs font-normal">(ऐच्छिक)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Looking forward to Bappa's darshan 🙏"
                    maxLength={500}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }}
                  />
                </div>
              )}

              {/* Submit */}
              <button type="submit"
                className="w-full py-4 rounded-xl font-devanagari font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: selectedStatus === 'COMING'
                    ? 'linear-gradient(135deg, #27ae60, #1e8449)'
                    : selectedStatus === 'MAYBE'
                    ? 'linear-gradient(135deg, #f39c12, #d68910)'
                    : 'linear-gradient(135deg, #7a4c2a, #5c3a1e)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                }}>
                {selectedStatus === 'COMING' ? '❤️ RSVP Confirm करा'
                  : selectedStatus === 'MAYBE' ? '🤔 Submit RSVP'
                  : '😔 Submit Response'}
              </button>

              {/* Change response */}
              <button type="button" onClick={() => setStep('question')}
                className="w-full py-2 text-xs text-amber-600 hover:text-amber-800 underline underline-offset-2">
                ← Change response
              </button>
            </form>
          </motion.div>
        )}

        {/* ─── SUBMITTING ──────────────────────────────────── */}
        {step === 'submitting' && (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-8">
            <div className="text-4xl animate-float mb-3">🙏</div>
            <p className="font-devanagari text-amber-700">RSVP जतन होत आहे...</p>
          </motion.div>
        )}

        {/* ─── DONE ────────────────────────────────────────── */}
        {step === 'done' && existingRsvp && (
          <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.6 }}
              className="text-5xl mb-4">
              {existingRsvp.status === 'COMING' ? '🎉' : existingRsvp.status === 'MAYBE' ? '🤗' : '🙏'}
            </motion.div>

            {existingRsvp.status === 'COMING' && (
              <>
                <p className="font-bold font-devanagari text-lg mb-2" style={{ color: '#27ae60' }}>
                  Thank You! 🙏
                </p>
                <p className="font-devanagari text-sm text-amber-800 mb-1">
                  तुमच्या उपस्थितीची आम्ही आतुरतेने वाट पाहत आहोत ❤️
                </p>
                <p className="text-xs text-amber-600 mb-4">
                  गणपती बाप्पा मोरया! 🙏
                </p>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl mb-4"
                  style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)' }}>
                  <span className="text-lg">❤️</span>
                  <div className="text-left">
                    <p className="text-xs text-amber-600">Your response</p>
                    <p className="font-bold text-sm" style={{ color: '#27ae60' }}>Coming • {existingRsvp.attendee_count} people</p>
                  </div>
                </div>
              </>
            )}

            {existingRsvp.status === 'MAYBE' && (
              <>
                <p className="font-bold font-devanagari text-lg mb-2" style={{ color: '#d97706' }}>
                  Thank You! 🤗
                </p>
                <p className="font-devanagari text-sm text-amber-800 mb-1">
                  शक्य झाल्यास जरूर या. बाप्पा तुमची वाट पाहत आहेत. ❤️
                </p>
                <p className="text-xs text-amber-600 mb-4">गणपती बाप्पा मोरया! 🙏</p>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl mb-4"
                  style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                  <span className="text-lg">🤔</span>
                  <div className="text-left">
                    <p className="text-xs text-amber-600">Your response</p>
                    <p className="font-bold text-sm" style={{ color: '#d97706' }}>Maybe • {existingRsvp.attendee_count} people</p>
                  </div>
                </div>
              </>
            )}

            {existingRsvp.status === 'NOT_ATTENDING' && (
              <>
                <p className="font-bold font-devanagari text-lg mb-2" style={{ color: '#7a4c2a' }}>
                  Thank You! 🙏
                </p>
                <p className="font-devanagari text-sm text-amber-800 mb-1">
                  पुढच्या वेळी नक्की या. बाप्पांचा आशीर्वाद तुमच्यावर आहे. ❤️
                </p>
                <p className="text-xs text-amber-600 mb-4">गणपती बाप्पा मोरया!</p>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl mb-4"
                  style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)' }}>
                  <span className="text-lg">😔</span>
                  <div className="text-left">
                    <p className="text-xs text-amber-600">Your response</p>
                    <p className="font-bold text-sm" style={{ color: '#6b7280' }}>Not Coming</p>
                  </div>
                </div>
              </>
            )}

            {!deadlinePassed && (
              <div className="flex justify-center gap-3 mt-2">
                <button onClick={startEdit}
                  className="px-4 py-2 rounded-xl text-xs font-medium border transition-all hover:bg-amber-50"
                  style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                  ✏️ Edit RSVP
                </button>
                <button onClick={startChangeResponse}
                  className="px-4 py-2 rounded-xl text-xs font-medium border transition-all hover:bg-amber-50"
                  style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                  🔄 Change Response
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { RSVPResponse } from '../../types';

interface Props {
  invitationId: string;
  guestId?: string;
  guestName?: string;
}

export default function RSVPCard({ invitationId, guestId, guestName }: Props) {
  const [step, setStep] = useState<'question' | 'count' | 'done'>('question');
  const [response, setResponse] = useState<RSVPResponse | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [name, setName] = useState(guestName || '');
  const [saving, setSaving] = useState(false);

  async function submitRSVP(resp: RSVPResponse) {
    setResponse(resp);
    if (resp === 'yes') {
      setStep('count');
    } else {
      await saveRSVP(resp, 0);
    }
  }

  async function saveRSVP(resp: RSVPResponse, count: number) {
    setSaving(true);
    await supabase.from('rsvps').insert({
      invitation_id: invitationId,
      guest_id: guestId || null,
      guest_name: name || null,
      response: resp,
      guest_count: count,
    });
    setSaving(false);
    setStep('done');
  }

  const COUNTS = [1, 2, 3, 4, 5];

  return (
    <div className="rounded-2xl p-6 text-center" style={{
      background: 'linear-gradient(135deg, rgba(255,115,0,0.06), rgba(192,57,43,0.04))',
      border: '1.5px solid rgba(255,115,0,0.2)',
    }}>
      <AnimatePresence mode="wait">
        {step === 'question' && (
          <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-2xl mb-3">🙏</p>
            <h3 className="font-bold font-devanagari text-lg mb-6" style={{ color: '#3d1f00' }}>
              बाप्पांच्या दर्शनाला तुम्ही येणार ना? ❤️
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => submitRSVP('yes')}
                className="w-full py-4 rounded-xl font-devanagari font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #27ae60, #1e8449)', boxShadow: '0 4px 15px rgba(39,174,96,0.3)' }}
              >
                🙏 नक्की येणार!
              </button>
              <button
                onClick={() => submitRSVP('maybe')}
                className="w-full py-4 rounded-xl font-devanagari font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f39c12, #d68910)', boxShadow: '0 4px 15px rgba(243,156,18,0.3)' }}
              >
                ❤️ प्रयत्न करतोय
              </button>
              <button
                onClick={() => submitRSVP('no')}
                className="w-full py-4 rounded-xl font-devanagari font-semibold transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(212,160,23,0.3)', color: '#7a4c2a' }}
              >
                😔 यावेळी शक्य नाही
              </button>
            </div>
          </motion.div>
        )}

        {step === 'count' && (
          <motion.div key="count" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-2xl mb-3">🎉</p>
            <h3 className="font-bold font-devanagari text-lg mb-2" style={{ color: '#3d1f00' }}>
              किती जण येणार?
            </h3>
            <p className="text-xs text-amber-600 mb-5">How many people are coming?</p>

            <div className="flex justify-center gap-3 mb-5">
              {COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setGuestCount(n)}
                  className={`w-12 h-12 rounded-full font-bold text-sm transition-all ${
                    guestCount === n
                      ? 'text-white scale-110'
                      : 'border-2 text-amber-700 border-amber-200 hover:border-saffron-400 bg-white'
                  }`}
                  style={guestCount === n ? { background: 'linear-gradient(135deg, #ff8c00, #ff6b00)' } : {}}
                >
                  {n === 5 ? '5+' : n}
                </button>
              ))}
            </div>

            {!guestName && (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="आपले नाव (ऐच्छिक)"
                className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none mb-4 font-devanagari bg-white"
                style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
              />
            )}

            <button
              onClick={() => saveRSVP('yes', guestCount)}
              disabled={saving}
              className="w-full py-4 rounded-xl font-devanagari font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ff8c00, #ff6b00)', boxShadow: '0 4px 15px rgba(255,115,0,0.3)' }}
            >
              {saving ? '⌛ जतन होत आहे...' : '✅ RSVP पाठवा'}
            </button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-5xl mb-4"
            >
              {response === 'yes' ? '🎉' : response === 'maybe' ? '🙏' : '❤️'}
            </motion.div>

            {response === 'yes' ? (
              <>
                <p className="font-bold font-devanagari text-lg mb-2" style={{ color: '#27ae60' }}>
                  RSVP मिळाले! 🙏
                </p>
                <p className="font-devanagari text-sm text-amber-800">
                  तुमच्या उपस्थितीची आम्ही आतुरतेने वाट पाहत आहोत ❤️
                </p>
              </>
            ) : response === 'maybe' ? (
              <>
                <p className="font-bold font-devanagari text-lg mb-2" style={{ color: '#f39c12' }}>
                  समजले! 🙏
                </p>
                <p className="font-devanagari text-sm text-amber-800">
                  शक्य झाल्यास जरूर या. बाप्पा तुमची वाट पाहत आहेत. ❤️
                </p>
              </>
            ) : (
              <>
                <p className="font-bold font-devanagari text-lg mb-2" style={{ color: '#7a4c2a' }}>
                  ठीक आहे 🙏
                </p>
                <p className="font-devanagari text-sm text-amber-800">
                  पुढच्या वेळी नक्की या. बाप्पांचा आशीर्वाद तुमच्यावर आहे. ❤️
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Props {
  invitationId: string;
  initialCount?: number;
}

const FLOWERS = ['🌸', '🌺', '🌼', '🌹', '🏵️'];

export default function FlowerOffering({ invitationId, initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);
  const [offered, setOffered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [floatingFlowers, setFloatingFlowers] = useState<{ id: number; emoji: string; x: number }[]>([]);

  async function offerFlower() {
    if (offered || animating) return;
    setAnimating(true);

    // Add floating flower animations
    const newFlowers = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
      x: (Math.random() - 0.5) * 200,
    }));
    setFloatingFlowers(newFlowers);
    setTimeout(() => setFloatingFlowers([]), 2000);

    // Save to Supabase
    await supabase.from('flower_offerings').insert({ invitation_id: invitationId });
    setCount(c => c + 1);
    setOffered(true);
    setAnimating(false);
  }

  return (
    <div className="relative text-center py-8 px-6 rounded-2xl" style={{
      background: 'linear-gradient(135deg, rgba(255,182,193,0.1), rgba(255,228,225,0.15))',
      border: '1px solid rgba(255,105,135,0.2)',
    }}>
      {/* Floating flowers animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {floatingFlowers.map(f => (
            <motion.div
              key={f.id}
              className="absolute bottom-1/3 left-1/2 text-2xl"
              initial={{ opacity: 1, y: 0, x: f.x / 2, scale: 1 }}
              animate={{ opacity: 0, y: -150, x: f.x, scale: 0.5, rotate: f.x > 0 ? 30 : -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              style={{ translateX: '-50%' }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-3xl mb-3">🌸</p>
      <h3 className="font-bold font-devanagari text-base mb-1" style={{ color: '#3d1f00' }}>
        बाप्पांच्या चरणी एक फूल अर्पण करा
      </h3>
      <p className="text-xs text-amber-600 mb-5">Offer a virtual flower to Bappa 🙏</p>

      {offered ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-3"
        >
          <p className="text-2xl mb-2">🙏</p>
          <p className="font-devanagari text-sm font-medium" style={{ color: '#c0392b' }}>
            आपल्या शुभेच्छा बाप्पांच्या चरणी अर्पण केल्या.
          </p>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={offerFlower}
          disabled={animating}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm font-devanagari transition-all"
          style={{
            background: 'linear-gradient(135deg, #ff6b9d, #ff4d7e)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(255,105,135,0.35)',
          }}
        >
          🌸 फूल अर्पण करा
        </motion.button>
      )}

      {count > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs text-pink-600 font-devanagari"
        >
          🌸 {count.toLocaleString('mr-IN')} भक्तांनी फुले अर्पण केली
        </motion.p>
      )}
    </div>
  );
}

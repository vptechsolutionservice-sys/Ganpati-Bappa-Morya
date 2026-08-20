import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Props {
  invitationId: string;
  initialCount?: number;
}

export default function DiyaOffering({ invitationId, initialCount = 0 }: Props) {
  const [lit, setLit] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  async function lightDiya() {
    if (lit) return;

    // Spawn particles
    const newP = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -(Math.random() * 60 + 20),
    }));
    setParticles(newP);
    setTimeout(() => setParticles([]), 2000);

    setLit(true);
    await supabase.from('diya_offerings').insert({ invitation_id: invitationId });
    setCount(c => c + 1);
  }

  return (
    <div className="relative text-center py-8 px-6 rounded-2xl" style={{
      background: 'linear-gradient(135deg, rgba(255,165,0,0.08), rgba(255,100,0,0.06))',
      border: '1px solid rgba(255,165,0,0.25)',
    }}>
      {/* Diya image / SVG */}
      <div className="relative inline-block mb-4">
        {/* Unlit / Lit diya */}
        <motion.div
          className="relative"
          animate={lit ? { filter: 'drop-shadow(0 0 20px rgba(255,165,0,0.8))' } : {}}
        >
          {/* Diya body */}
          <div className="w-16 h-10 mx-auto rounded-b-full rounded-t-sm relative flex items-end justify-center pb-1"
            style={{ background: 'linear-gradient(135deg, #cd7f32, #8b5e3c)', border: '2px solid #a0522d' }}>
            {/* Oil */}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 h-2 rounded-full opacity-60"
              style={{ background: '#d4a017' }} />
            {/* Wick */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 rounded-full" style={{ background: '#5c3317' }} />
          </div>

          {/* Flame */}
          <AnimatePresence>
            {lit && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{ scaleY: [1, 1.15, 1], scaleX: [1, 0.85, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-5 h-10 rounded-full"
                  style={{ background: 'linear-gradient(to top, #ff6b00, #ffcc00, #fff)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow */}
          <AnimatePresence>
            {lit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full -z-10"
                style={{ background: 'radial-gradient(circle, rgba(255,165,0,0.6), transparent)', transform: 'scale(2)' }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full"
              style={{ background: '#ffd700' }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </div>

      <h3 className="font-bold font-devanagari text-base mb-1" style={{ color: '#3d1f00' }}>
        बाप्पांसाठी दिवा लावा 🪔
      </h3>
      <p className="text-xs text-amber-600 mb-5">Light a virtual diya for Bappa</p>

      {lit ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-devanagari text-sm font-medium" style={{ color: '#c0392b' }}>
            बाप्पांच्या चरणी प्रकाश अर्पण केला 🪔
          </p>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={lightDiya}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm font-devanagari text-white"
          style={{ background: 'linear-gradient(135deg, #ff8c00, #ff6b00)', boxShadow: '0 4px 15px rgba(255,115,0,0.4)' }}
        >
          🪔 दिवा लावा
        </motion.button>
      )}

      {count > 0 && (
        <p className="mt-4 text-xs text-amber-600 font-devanagari">
          🪔 {count.toLocaleString('mr-IN')} दिवे लावले गेले
        </p>
      )}
    </div>
  );
}

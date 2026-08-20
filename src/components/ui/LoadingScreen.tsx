import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #fff8f0 0%, #fdf0dc 100%)' }}>
      {/* Animated diya */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], filter: ['drop-shadow(0 0 10px rgba(255,165,0,0.3))', 'drop-shadow(0 0 30px rgba(255,165,0,0.8))', 'drop-shadow(0 0 10px rgba(255,165,0,0.3))'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-6"
      >
        🪔
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-devanagari text-lg font-semibold mb-2"
        style={{ color: '#ff7300' }}
      >
        🙏 बाप्पांचे आमंत्रण तयार होत आहे...
      </motion.p>

      <p className="text-sm text-amber-600">Loading your festive experience</p>

      {/* Dots loader */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: '#d4a017' }}
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

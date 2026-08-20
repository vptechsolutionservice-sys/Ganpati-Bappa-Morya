import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCountdown } from '../../lib/utils';

interface Props {
  arrivalDate: string;
  arrivalTime: string;
  visarjanDate: string;
  visarjanTime: string;
}

export default function CountdownTimer({ arrivalDate, arrivalTime, visarjanDate, visarjanTime }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const arrivalMs = new Date(`${arrivalDate}T${arrivalTime}:00`).getTime();
  const visarjanMs = new Date(`${visarjanDate}T${visarjanTime}:00`).getTime();

  let phase: 'pre-arrival' | 'active' | 'pre-visarjan' | 'post-visarjan' = 'pre-arrival';
  if (now >= visarjanMs) phase = 'post-visarjan';
  else if (now >= arrivalMs) phase = 'active';

  const countdown =
    phase === 'pre-arrival'
      ? getCountdown(arrivalDate, arrivalTime)
      : phase === 'active'
      ? getCountdown(visarjanDate, visarjanTime)
      : null;

  const labels: Record<string, string> = {
    'pre-arrival': 'बाप्पांच्या आगमनाला...',
    'active': 'बाप्पांच्या विसर्जनाला...',
    'pre-visarjan': 'बाप्पांच्या विसर्जनाला...',
    'post-visarjan': '',
  };

  if (phase === 'post-visarjan') {
    return (
      <div className="text-center py-6 px-4 rounded-2xl" style={{ background: 'rgba(255,115,0,0.08)', border: '1px solid rgba(255,115,0,0.2)' }}>
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-devanagari font-bold text-lg" style={{ color: '#ff7300' }}>
          गणपती बाप्पा मोरया!
        </p>
        <p className="font-devanagari text-amber-700 text-sm">पुढच्या वर्षी लवकर या! ❤️</p>
      </div>
    );
  }

  if (phase === 'active' && !countdown?.days && !countdown?.hours) {
    return (
      <div className="text-center py-6 px-4 rounded-2xl" style={{ background: 'rgba(255,115,0,0.08)', border: '1px solid rgba(255,115,0,0.2)' }}>
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-devanagari font-bold" style={{ color: '#ff7300' }}>
          बाप्पा आपल्या घरी विराजमान झाले आहेत 🙏
        </p>
      </div>
    );
  }

  if (!countdown) return null;

  const units = [
    { value: countdown.days, label: 'Days', labelMr: 'दिवस' },
    { value: countdown.hours, label: 'Hours', labelMr: 'तास' },
    { value: countdown.minutes, label: 'Min', labelMr: 'मिनिटे' },
    { value: countdown.seconds, label: 'Sec', labelMr: 'सेकंद' },
  ];

  return (
    <div className="rounded-2xl py-5 px-4" style={{ background: 'rgba(255,115,0,0.06)', border: '1px solid rgba(255,115,0,0.15)' }}>
      <p className="text-center text-xs font-devanagari font-semibold mb-4" style={{ color: '#ff7300' }}>
        ⏳ {labels[phase]}
      </p>
      <div className="flex justify-center gap-3">
        {units.map(u => (
          <motion.div
            key={u.label}
            className="flex flex-col items-center"
            animate={{ scale: u.label === 'Sec' ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner"
              style={{ background: 'linear-gradient(135deg, #fff8f0, #fdf0dc)', border: '1.5px solid rgba(212,160,23,0.3)' }}>
              <span className="text-2xl font-bold tabular-nums" style={{
                background: 'linear-gradient(135deg, #ff7300, #d45d00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {String(u.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] font-devanagari mt-1" style={{ color: '#a07050' }}>{u.labelMr}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

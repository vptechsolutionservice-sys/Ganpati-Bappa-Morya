import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastFn = (message: string, type?: ToastType) => void;

// Global toast function (singleton pattern)
let _addToast: ToastFn | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  _addToast?.(message, type);
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: '🙏',
  warning: '⚠️',
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: '#f0fdf4', border: 'rgba(39,174,96,0.4)', text: '#166534' },
  error:   { bg: '#fef2f2', border: 'rgba(239,68,68,0.4)', text: '#991b1b' },
  info:    { bg: '#fffdf5', border: 'rgba(212,160,23,0.4)', text: '#7a4c2a' },
  warning: { bg: '#fffbeb', border: 'rgba(245,158,11,0.4)', text: '#92400e' },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const c = COLORS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-festive pointer-events-auto"
              style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.text }}
            >
              <span className="text-lg flex-shrink-0">{ICONS[toast.type]}</span>
              <p className="text-sm font-medium flex-1 font-devanagari">{toast.message}</p>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../ui/Toaster';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Tab = 'signin' | 'signup';

export default function AuthModal({ open, onClose, onSuccess }: Props) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          showToast('Login अयशस्वी. Email आणि password तपासा.', 'error');
        } else {
          showToast('स्वागत आहे! 🙏', 'success');
          onClose();
          onSuccess?.();
        }
      } else {
        if (!name.trim()) {
          showToast('कृपया आपले नाव भरा.', 'error');
          return;
        }
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          showToast('Account तयार करता आले नाही. पुन्हा प्रयत्न करा.', 'error');
        } else {
          showToast('Account तयार झाले! Email verify करा. 🙏', 'success');
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await signInWithGoogle();
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(61, 31, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: '#fffdf5', border: '1.5px solid rgba(212,160,23,0.3)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-8 pt-8 pb-4">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-amber-50 rounded-full">
              <X className="w-5 h-5 text-amber-600" />
            </button>
            <div className="text-center">
              <div className="text-4xl mb-2">🙏</div>
              <h2 className="text-2xl font-bold font-devanagari" style={{ color: '#ff7300' }}>
                {tab === 'signin' ? 'स्वागत आहे!' : 'नवीन Account'}
              </h2>
              <p className="text-sm text-amber-700 mt-1">
                {tab === 'signin' ? 'Sign in to manage your invitations' : 'Create an account to save your invitations'}
              </p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {/* Google button */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all hover:bg-amber-50 mb-6"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
            >
              <Globe className="w-5 h-5 text-blue-500" />
              Google ने Login करा
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-amber-200" />
              <span className="text-xs text-amber-500 font-medium">किंवा</span>
              <div className="flex-1 h-px bg-amber-200" />
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-amber-200 mb-6">
              {(['signin', 'signup'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                    tab === t ? 'bg-saffron-500 text-white' : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {t === 'signin' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {tab === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="आपले नाव"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm outline-none focus:border-saffron-400 bg-white transition-colors"
                    style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm outline-none focus:border-saffron-400 bg-white transition-colors"
                  style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm outline-none focus:border-saffron-400 bg-white transition-colors"
                  style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-saffron w-full py-3 disabled:opacity-60"
              >
                {loading ? '⌛ प्रयत्न होत आहे...' : tab === 'signin' ? '🙏 Login' : '✨ Account तयार करा'}
              </button>
            </form>

            <p className="text-center mt-6 text-xs text-amber-600">
              पुढे जाण्यासाठी{' '}
              <button onClick={onClose} className="underline text-saffron-600 hover:text-saffron-700">
                account शिवाय सुरू करा
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

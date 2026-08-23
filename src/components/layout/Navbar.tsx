import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full" style={{
        background: 'rgba(253, 246, 227, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212, 160, 23, 0.2)',
        boxShadow: '0 2px 12px rgba(61, 31, 0, 0.06)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🪔</span>
              <div>
                <p className="text-sm font-bold font-devanagari leading-none" style={{ color: '#ff7300' }}>
                  गणपती आमंत्रण
                </p>
                <p className="text-[10px] text-amber-700 leading-none">Bappa Invitation</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/templates" className={cn(
                'text-sm font-medium transition-colors hover:text-saffron-600',
                isActive('/templates') ? 'text-saffron-600' : 'text-amber-800'
              )}>
                Templates
              </Link>
              {user && (
                <Link to="/dashboard" className={cn(
                  'text-sm font-medium transition-colors hover:text-saffron-600',
                  location.pathname.startsWith('/dashboard') ? 'text-saffron-600' : 'text-amber-800'
                )}>
                  Dashboard
                </Link>
              )}
            </div>

            {/* CTA + Install + User */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Top Mobile/Desktop Install App Button */}
              {!isStandalone && (
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border-2 border-saffron-500 bg-saffron-50 text-saffron-700 hover:bg-saffron-100 transition-all shadow-sm animate-pulse"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="font-devanagari">📲 ॲप इनस्टॉल</span>
                </button>
              )}

              <Link to="/create" className="hidden sm:flex btn-saffron text-sm px-4 py-2">
                🙏 आमंत्रण तयार करा
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-saffron-600" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl border shadow-festive overflow-hidden"
                        style={{ background: '#fffdf5', borderColor: 'rgba(212,160,23,0.3)' }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
                          <p className="text-xs text-amber-600 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { navigate('/dashboard'); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-amber-50 text-amber-900"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-amber-50 text-amber-900"
                          >
                            <Shield className="w-4 h-4" /> Admin Panel
                          </button>
                        )}
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 border-t"
                          style={{ borderColor: 'rgba(212,160,23,0.2)' }}
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-xl border-2 transition-all hover:bg-amber-50"
                  style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#7a4c2a' }}
                >
                  Login
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-amber-50"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: 'rgba(212,160,23,0.2)', background: '#fffdf5' }}
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                <Link to="/create" className="btn-saffron justify-center text-sm" onClick={() => setMenuOpen(false)}>
                  🙏 आमंत्रण तयार करा
                </Link>
                {!isStandalone && (
                  <button
                    onClick={() => { setInstallModalOpen(true); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-saffron-500 bg-saffron-50 text-saffron-700 font-bold text-sm"
                  >
                    <Download className="w-4 h-4" /> 📲 ॲप फोनमध्ये इनस्टॉल करा
                  </button>
                )}
                <Link to="/templates" onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 rounded-lg">
                  Templates
                </Link>
                {user && (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 rounded-lg">
                    Dashboard
                  </Link>
                )}
                {!user && (
                  <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }}
                    className="px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 rounded-lg text-left">
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* PWA Installation Modal */}
      <AnimatePresence>
        {installModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setInstallModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="gold-card p-6 max-w-sm w-full text-center relative"
            >
              <button
                onClick={() => setInstallModalOpen(false)}
                className="absolute top-3 right-3 p-1 rounded-full text-amber-800 hover:bg-amber-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-4xl mb-2">📱</div>
              <h3 className="text-lg font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
                गणपती आमंत्रण ॲप इनस्टॉल करा
              </h3>
              <p className="text-xs text-amber-700 mb-4">Install App on your mobile phone Home Screen</p>

              <div className="space-y-3 text-left text-xs text-amber-900 bg-amber-50/80 p-4 rounded-xl border border-amber-200 mb-5">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-saffron-600 text-sm">1.</span>
                  <p><strong>Android (Chrome):</strong> Click <strong>⋮ Menu</strong> on top right → Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-saffron-600 text-sm">2.</span>
                  <p><strong>iPhone (Safari):</strong> Tap the <strong>Share 📤</strong> button at the bottom → Scroll & select <strong>"Add to Home Screen ➕"</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setInstallModalOpen(false)}
                className="btn-saffron w-full py-2.5 text-sm"
              >
                समजले (Got it) ✓
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

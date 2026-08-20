import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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

            {/* CTA + User */}
            <div className="flex items-center gap-3">
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
                  className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all hover:bg-amber-50"
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

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';

const NAV_ITEMS = [
  { to: '/admin',                  label: 'Dashboard',        icon2: '📊' },
  { to: '/admin/payments',         label: 'Payments',         icon2: '💳' },
  { to: '/admin/payments/history', label: 'Payment History',  icon2: '📋' },
  { to: '/admin/users',            label: 'Users',            icon2: '👥' },
  { to: '/admin/invitations',      label: 'Invitations',      icon2: '📜' },
  { to: '/admin/templates',        label: 'Templates',        icon2: '🎨' },
  { to: '/admin/images',           label: 'Images',           icon2: '🖼️' },
  { to: '/admin/settings',         label: 'Settings',         icon2: '⚙️' },
];

interface AdminLayoutProps { children: React.ReactNode }

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      showToast('Admin access required.', 'error');
      navigate('/');
    }
  }, [user, isAdmin, loading]);

  if (loading || !isAdmin) return null;

  return (
    <div className="flex min-h-screen" style={{ background: '#fdf6e3' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r"
        style={{ background: '#3d1f00', borderColor: 'rgba(212,160,23,0.2)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
          <p className="text-2xl mb-1">🙏</p>
          <p className="font-bold text-white text-sm">Ganpati Admin</p>
          <p className="text-xs text-amber-400">Management Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-saffron-500 text-white' : 'text-amber-200 hover:bg-white/10'
                }`}>
                <span>{item.icon2}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
          <button onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-amber-200 hover:bg-white/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b" style={{ background: '#3d1f00', borderColor: 'rgba(212,160,23,0.2)' }}>
          <p className="font-bold text-white">🙏 Admin</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 text-xl">☰</button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="relative flex-1 flex flex-col max-w-[240px] w-full min-h-screen border-r shadow-2xl"
              style={{ background: '#3d1f00', borderColor: 'rgba(212,160,23,0.2)' }}
            >
              <div className="p-6 border-b flex justify-between items-start" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
                <div>
                  <p className="text-2xl mb-1">🙏</p>
                  <p className="font-bold text-white text-sm">Ganpati Admin</p>
                  <p className="text-xs text-amber-400">Management Panel</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white p-1">✕</button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                  const active = location.pathname === item.to;
                  return (
                    <Link key={item.to} to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-saffron-500 text-white' : 'text-amber-200 hover:bg-white/10'
                      }`}>
                      <span>{item.icon2}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
                <button onClick={signOut}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-amber-200 hover:bg-white/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, Palette, Image, BarChart3, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';

const NAV_ITEMS = [
  { to: '/admin', icon: Home, label: 'Dashboard', icon2: '📊' },
  { to: '/admin/users', icon: Users, label: 'Users', icon2: '👥' },
  { to: '/admin/invitations', icon: FileText, label: 'Invitations', icon2: '📜' },
  { to: '/admin/templates', icon: Palette, label: 'Templates', icon2: '🎨' },
  { to: '/admin/images', icon: Image, label: 'Images', icon2: '🖼️' },
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
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">☰</button>
        </div>

        <main className="flex-1 p-4 sm:p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

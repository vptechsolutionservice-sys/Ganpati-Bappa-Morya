import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CreateInvitation = lazy(() => import('./pages/CreateInvitation'));
const Templates = lazy(() => import('./pages/Templates'));
const InvitationView = lazy(() => import('./pages/InvitationView'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const DashboardInvitations = lazy(() => import('./pages/dashboard/DashboardInvitations'));
const DashboardGuests = lazy(() => import('./pages/dashboard/DashboardGuests'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardMemories = lazy(() => import('./pages/dashboard/DashboardMemories'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTemplates = lazy(() => import('./pages/admin/AdminTemplates'));
const AdminImages = lazy(() => import('./pages/admin/AdminImages'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminInvitations = lazy(() => import('./pages/admin/AdminInvitations'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateInvitation />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/invite/:slug" element={<InvitationView />} />
            <Route path="/invite/:slug/:guest" element={<InvitationView />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/invitations" element={<DashboardInvitations />} />
            <Route path="/dashboard/guests" element={<DashboardGuests />} />
            <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
            <Route path="/dashboard/memories" element={<DashboardMemories />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/images" element={<AdminImages />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/invitations" element={<AdminInvitations />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

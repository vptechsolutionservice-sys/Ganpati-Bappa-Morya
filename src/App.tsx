import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load pages for code splitting
const LandingPage          = lazy(() => import('./pages/LandingPage'));
const CreateInvitation     = lazy(() => import('./pages/CreateInvitation'));
const Templates            = lazy(() => import('./pages/Templates'));
const InvitationView       = lazy(() => import('./pages/InvitationView'));
const PaymentPage          = lazy(() => import('./pages/PaymentPage'));
const PaymentStatusPage    = lazy(() => import('./pages/PaymentStatusPage'));

// Dashboard
const Dashboard            = lazy(() => import('./pages/dashboard/Dashboard'));
const DashboardInvitations = lazy(() => import('./pages/dashboard/DashboardInvitations'));
const DashboardGuests      = lazy(() => import('./pages/dashboard/DashboardGuests'));
const DashboardAnalytics   = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardMemories    = lazy(() => import('./pages/dashboard/DashboardMemories'));
const DashboardPayments    = lazy(() => import('./pages/dashboard/DashboardPayments'));
const DashboardRSVP        = lazy(() => import('./pages/dashboard/DashboardRSVP'));
const DashboardRSVPSettings = lazy(() => import('./pages/dashboard/DashboardRSVPSettings'));

// Admin
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPayments        = lazy(() => import('./pages/admin/AdminPayments'));
const AdminPaymentReview   = lazy(() => import('./pages/admin/AdminPaymentReview'));
const AdminPaymentHistory  = lazy(() => import('./pages/admin/AdminPaymentHistory'));
const AdminTemplates       = lazy(() => import('./pages/admin/AdminTemplates'));
const AdminImages          = lazy(() => import('./pages/admin/AdminImages'));
const AdminUsers           = lazy(() => import('./pages/admin/AdminUsers'));
const AdminInvitations     = lazy(() => import('./pages/admin/AdminInvitations'));
const AdminSettings        = lazy(() => import('./pages/admin/AdminSettings'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/"                         element={<LandingPage />} />
            <Route path="/create"                   element={<CreateInvitation />} />
            <Route path="/templates"                element={<Templates />} />
            <Route path="/invite/:slug"             element={<InvitationView />} />
            <Route path="/invite/:slug/:guest"      element={<InvitationView />} />

            {/* Payment routes */}
            <Route path="/payment/:invitationId"        element={<PaymentPage />} />
            <Route path="/payment-status/:paymentId"    element={<PaymentStatusPage />} />

            {/* Dashboard routes */}
            <Route path="/dashboard"                    element={<Dashboard />} />
            <Route path="/dashboard/invitations"        element={<DashboardInvitations />} />
            <Route path="/dashboard/guests"             element={<DashboardGuests />} />
            <Route path="/dashboard/analytics"          element={<DashboardAnalytics />} />
            <Route path="/dashboard/memories"           element={<DashboardMemories />} />
            <Route path="/dashboard/payments"           element={<DashboardPayments />} />
            <Route path="/dashboard/invitations/:id/rsvp"          element={<DashboardRSVP />} />
            <Route path="/dashboard/invitations/:id/rsvp/settings" element={<DashboardRSVPSettings />} />

            {/* Admin routes */}
            <Route path="/admin"                        element={<AdminDashboard />} />
            <Route path="/admin/payments"               element={<AdminPayments />} />
            <Route path="/admin/payments/history"       element={<AdminPaymentHistory />} />
            <Route path="/admin/payments/:id"           element={<AdminPaymentReview />} />
            <Route path="/admin/templates"              element={<AdminTemplates />} />
            <Route path="/admin/images"                 element={<AdminImages />} />
            <Route path="/admin/users"                  element={<AdminUsers />} />
            <Route path="/admin/invitations"            element={<AdminInvitations />} />
            <Route path="/admin/settings"              element={<AdminSettings />} />

            {/* Catch-all */}
            <Route path="*"                             element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

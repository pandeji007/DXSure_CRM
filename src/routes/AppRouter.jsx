import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminRoute from './AdminRoute';
import ProtectedRoute from './ProtectedRoute';

const AppLayout = lazy(() => import('../components/layout/AppLayout'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const ActivityPage = lazy(() => import('../pages/activity/ActivityPage'));
const ClientsPage = lazy(() => import('../pages/clients/ClientsPage'));
const ClientDetailPage = lazy(() => import('../pages/clients/ClientDetailPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const DayPlanPage = lazy(() => import('../pages/dayplan/DayPlanPage'));
const EmployeesPage = lazy(() => import('../pages/employees/EmployeesPage'));
const EmployeeDetailPage = lazy(() => import('../pages/employees/EmployeeDetailPage'));
const FinancePage = lazy(() => import('../pages/finance/FinancePage'));
const FollowUpsPage = lazy(() => import('../pages/followups/FollowUpsPage'));
const LeadsPage = lazy(() => import('../pages/leads/LeadsPage'));
const LeadDetailPage = lazy(() => import('../pages/leads/LeadDetailPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const TicketsPage = lazy(() => import('../pages/tickets/TicketsPage'));
const TicketDetailPage = lazy(() => import('../pages/tickets/TicketDetailPage'));
const VendorsPage = lazy(() => import('../pages/vendors/VendorsPage'));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="mt-4 text-sm font-medium text-text-secondary">Loading session...</p>
    </div>
  );
}

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/follow-ups" element={<FollowUpsPage />} />
            <Route path="/day-plans" element={<DayPlanPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route
              path="/vendors"
              element={
                <AdminRoute>
                  <VendorsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <AdminRoute>
                  <EmployeesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <AdminRoute>
                  <EmployeeDetailPage />
                </AdminRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <AdminRoute>
                  <ActivityPage />
                </AdminRoute>
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

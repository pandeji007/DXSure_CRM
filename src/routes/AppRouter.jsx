import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ClientsPage from '../pages/clients/ClientsPage';
import ClientDetailPage from '../pages/clients/ClientDetailPage';
import LeadsPage from '../pages/leads/LeadsPage';
import LeadDetailPage from '../pages/leads/LeadDetailPage';
import TicketsPage from '../pages/tickets/TicketsPage';
import TicketDetailPage from '../pages/tickets/TicketDetailPage';
import FollowUpsPage from '../pages/followups/FollowUpsPage';
import FinancePage from '../pages/finance/FinancePage';
import VendorsPage from '../pages/vendors/VendorsPage';
import DayPlanPage from '../pages/dayplan/DayPlanPage';
import EmployeesPage from '../pages/employees/EmployeesPage';
import EmployeeDetailPage from '../pages/employees/EmployeeDetailPage';
import ActivityPage from '../pages/activity/ActivityPage';
import SettingsPage from '../pages/settings/SettingsPage';

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
          <Route path="day-plans" element={<DayPlanPage />} />
          <Route
            path="finance"
            element={
              <AdminRoute>
                <FinancePage />
              </AdminRoute>
            }
          />
          <Route
            path="vendors"
            element={
              <AdminRoute>
                <VendorsPage />
              </AdminRoute>
            }
          />
          <Route
            path="employees"
            element={
              <AdminRoute>
                <EmployeesPage />
              </AdminRoute>
            }
          />
          <Route
            path="employees/:id"
            element={
              <AdminRoute>
                <EmployeeDetailPage />
              </AdminRoute>
            }
          />
          <Route
            path="activity"
            element={
              <AdminRoute>
                <ActivityPage />
              </AdminRoute>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

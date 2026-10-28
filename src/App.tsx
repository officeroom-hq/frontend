import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { RequireCapability } from './components/RequireCapability';
import DashboardPage from './features/dashboard/DashboardPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth/AuthPages';
import { SetupWizardPage } from './features/setup-wizard/SetupWizardPage';
import { FilesPage } from './features/files/FilesPage';
import { DepartmentsPage } from './features/departments/DepartmentsPage';
import { AuditPage } from './features/audit/AuditPage';
import { MessagingPage } from './features/messaging/MessagingPage';
import PeoplePage from './pages/PeoplePage';
import WorkspacePage from './pages/WorkspacePage';
import DataCenterPage from './pages/DataCenterPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/setup" element={<RequireAuth><SetupWizardPage /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/files" element={<RequireAuth><RequireCapability capability="files:view"><FilesPage /></RequireCapability></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><RequireCapability capability="departments:view"><DepartmentsPage /></RequireCapability></RequireAuth>} />
      <Route path="/audit" element={<RequireAuth><RequireCapability capability="audit:view"><AuditPage /></RequireCapability></RequireAuth>} />
      <Route path="/messages" element={<RequireAuth><RequireCapability capability="messages:view"><MessagingPage /></RequireCapability></RequireAuth>} />
      <Route path="/workspace" element={<RequireAuth><WorkspacePage /></RequireAuth>} />
      <Route path="/people" element={<RequireAuth><PeoplePage /></RequireAuth>} />
      <Route path="/data" element={<RequireAuth><DataCenterPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastProvider } from './context/ToastContext';
import { PageLoader } from './components/ui/Loader';
import TokenRefreshManager from './components/auth/TokenRefreshManager';

/* Layouts */
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

/* Guards */
import AuthGuard from './guards/AuthGuard';
import RoleGuard from './guards/RoleGuard';

/* Public Pages */
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

/* Auth Pages */
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

/* Dashboard & Core Features */
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const FinancialProfilePage = lazy(() => import('./pages/profile/FinancialProfilePage'));

const NewAssessmentPage = lazy(() => import('./pages/assessments/NewAssessmentPage'));
const AssessmentDetailPage = lazy(() => import('./pages/assessments/AssessmentDetailPage'));
const AssessmentHistoryPage = lazy(() => import('./pages/assessments/AssessmentHistoryPage'));
const ComparisonPage = lazy(() => import('./pages/assessments/ComparisonPage'));

const GoalsPage = lazy(() => import('./pages/goals/GoalsPage'));
const GoalDetailPage = lazy(() => import('./pages/goals/GoalDetailPage'));
const GoalFormPage = lazy(() => import('./pages/goals/GoalFormPage'));

const UpgradePage = lazy(() => import('./pages/premium/UpgradePage'));
const ConsultationsPage = lazy(() => import('./pages/consultations/ConsultationsPage'));

const AdvisorDashboardPage = lazy(() => import('./pages/advisor/AdvisorDashboardPage'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/AdminSubscriptionsPage'));
const AdminLoanTypesPage = lazy(() => import('./pages/admin/AdminLoanTypesPage'));

const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));

export default function App() {
  return (
    <Provider store={store}>
      <TokenRefreshManager />
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              
              {/* Public Website Routes (with Navbar & Footer) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Protected Application Routes */}
              <Route element={<AuthGuard />}>
                <Route element={<AppLayout />}>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Financial Profile */}
                  <Route path="/financial-profile" element={<FinancialProfilePage />} />

                  {/* Assessments */}
                  <Route path="/assessments" element={<AssessmentHistoryPage />} />
                  <Route path="/assessments/new" element={<NewAssessmentPage />} />
                  <Route path="/assessments/compare" element={<ComparisonPage />} />
                  <Route path="/assessments/:id" element={<AssessmentDetailPage />} />

                  {/* Goals */}
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/goals/new" element={<GoalFormPage />} />
                  <Route path="/goals/:id" element={<GoalDetailPage />} />
                  <Route path="/goals/:id/edit" element={<GoalFormPage />} />

                  {/* Premium & Payments */}
                  <Route path="/upgrade" element={<UpgradePage />} />

                  {/* Consultations */}
                  <Route path="/consultations" element={<ConsultationsPage />} />

                  {/* Settings */}
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Advisor routes */}
                  <Route element={<RoleGuard allowedRoles={['FINANCIAL_ADVISOR', 'ADMINISTRATOR']} />}>
                    <Route path="/advisor" element={<AdvisorDashboardPage />} />
                  </Route>

                  {/* Admin routes */}
                  <Route element={<RoleGuard allowedRoles={['ADMINISTRATOR']} />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
                    <Route path="/admin/loan-types" element={<AdminLoanTypesPage />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

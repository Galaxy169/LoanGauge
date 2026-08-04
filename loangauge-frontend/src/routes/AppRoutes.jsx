import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/public/HomePage";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import AboutUsPage from "../pages/public/AboutUsPage";
import ContactUsPage from "../pages/public/ContactUsPage";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage";
import TermsAndConditionsPage from "../pages/public/TermsAndConditionsPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import ProfilePage from "../pages/profile/ProfilePage";
import AssessmentFormPage from "../pages/assessment/AssessmentFormPage";
import GoalsPage from "../pages/goals/GoalsPage";
import ComparisonPage from "../pages/comparison/ComparisonPage";
import AdvisorDashboardPage from "../pages/advisor/AdvisorDashboardPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

import ReportsPage from '../pages/reports/ReportsPage';
<<<<<<< HEAD
=======
import DevLoginPage from "../pages/auth/DevLoginPage";
import AssessmentResultPage from "../pages/assessment/AssessmentResultPage";
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route
        path="/terms-and-conditions"
        element={<TermsAndConditionsPage />}
      />
      <Route path="/dev-login" element={<DevLoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        element={<ProtectedRoute allowedRoles={["USER", "PREMIUM_USER"]} />}
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assessment" element={<AssessmentFormPage />} />
        <Route path="/assessment/result" element={<AssessmentResultPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["FINANCIAL_ADVISOR"]} />}>
        <Route path="/advisor" element={<AdvisorDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

<<<<<<< HEAD
        <Route path="/reports/:assessmentId" element={
  <ProtectedRoute><ReportsPage /></ProtectedRoute>
} />


=======
      <Route
        path="/reports/:assessmentId"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
    </Routes>
  );
}

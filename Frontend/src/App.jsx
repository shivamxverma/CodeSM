import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginCard from "./auth/login/LoginCard";
import SignUpCard from "./auth/signup/SignUpCard";
import ProblemPage from "./views/problemPage/ProblemPage";
import Dashboard from "./views/dashboard/DashBoard";
import Problems from "./views/problems/problems";
import NewProblem from "./views/newProblem/NewProblem";
import ContestListPage from "./views/contest/ContestListPage";
import ContestCreatePage from "./views/contest/ContestCreatePage";
import ContestLobbyAndRun from "./views/contest/ContestLobbyAndRun";
import InterviewAssistant from "./views/interview/InterviewPage";
import DiscussionPage from "./views/discussion/DiscussionPage";
import AdminDashboard from "./views/admin/AdminDashboard";
import OAuthSuccess from "./lib/OAuthSuccess";
import ForgotPassword from "./lib/ForgotPassword";
import ResetPassword from "./lib/ResetPassword";

import { AuthProvider } from "./utils/AuthContext";
import RequireRole from "./utils/RequireRole";
import ProtectedRoute from "./utils/ProtectedRoute";
import Layout from "./Layout";
import VerifyEmailPage from "./auth/verify";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginCard />} />
          <Route path="/signup" element={<SignUpCard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemPage />} />
            <Route
              path="/newproblem"
              element={
                <ProtectedRoute>
                  <RequireRole allowed={["admin", "author"]}>
                    <NewProblem />
                  </RequireRole>
                </ProtectedRoute>
              }
            />
            <Route path="/contests" element={<ContestListPage />} />
            <Route
              path="/contests/create"
              element={
                <RequireRole allowed={["admin", "author"]}>
                  <ContestCreatePage />
                </RequireRole>
              }
            />
            <Route path="/contest/:id" element={<ContestLobbyAndRun />} />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewAssistant />
                </ProtectedRoute>
              }
            />
            <Route path="/discuss" element={<DiscussionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

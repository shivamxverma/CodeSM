import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginCard from "./views/users/LoginCard";
import SignUpCard from "./views/users/SignUpCard";
import ProblemPage from "./views/problem/ProblemPage";
import Dashboard from "./views/dashboard/DashBoard";
import Problems from "./views/problem/problems";
import NewProblem from "./views/problem/NewProblem";
import ContestListPage from "./views/contest/ContestListPage";
import ContestCreatePage from "./views/contest/ContestCreatePage";
import ContestLobbyAndRun from "./views/contest/ContestLobbyAndRun";
import InterviewAssistant from "./views/interview/InterviewPage";
import DiscussionPage from "./views/discussion/DiscussionPage";
import AdminDashboard from "./views/admin/AdminDashboard";
import OAuthSuccess from "./views/users/OAuthSuccess";

import { AuthProvider } from "./auth/AuthContext";
import RequireRole from "./auth/RequireRole";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./Layout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginCard />} />
          <Route path="/signup" element={<SignUpCard />} />
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

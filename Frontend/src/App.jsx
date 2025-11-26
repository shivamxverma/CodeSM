import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginCard from "./pages/users/LoginCard";
import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage";
import Dashboard from "./pages/dashboard/DashBoard";
import Problems from "./pages/users/problem";
import NewProblem from "./pages/admin/NewProblem";
import ContestListPage from "./pages/ContestListPage";
import ContestCreatePage from "./pages/ContestCreatePage";
import ContestLobbyAndRun from "./pages/ContestLobbyAndRun";
import InterviewAssistant from "./pages/InterviewPage";
import DiscussionPage from "./pages/DiscussionPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

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
          <Route path="/admin" element={<AdminDashboard/>} />

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

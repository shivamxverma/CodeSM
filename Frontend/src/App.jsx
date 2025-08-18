import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginCard from "./pages/users/LoginCard";
import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage";
import Dashboard from "./pages/dashboard/DashBoard";
import Problems from "./pages/users/problem";
import NavBar from "./components/NavBar";
import NewProblem from "./pages/admin/NewProblem";
import ContestListPage from "./pages/ContestListPage";
import ContestCreatePage from "./pages/ContestCreatePage";
import ContestLobbyAndRun from "./pages/ContestLobbyAndRun";
import InterviewAssistant from "./pages/InterviewPage";
import DiscussionPage from './pages/DiscussionPage';

import { AuthProvider } from "./auth/AuthContext";
import RequireRole from "./auth/RequireRole";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />

        <Routes>
          <Route path="/login" element={<LoginCard />} />
          <Route path="/signup" element={<SignUpCard />} />
          <Route path="/discussion" element={<DiscussionPage/>}></Route>


          <Route
            path="/"
            element={
              <Dashboard />
            }
          />
          <Route
            path="/problems"
            element={
              <Problems />
            }
          />
          <Route
            path="/problems/:id"
            element={
              <ProblemPage />
            }
          />

          <Route
            path="/newproblem"
            element={
              <RequireRole allowed={["AUTHOR", "ADMIN"]}>
                <NewProblem />
              </RequireRole>
            }
          />

          <Route
            path="/contests"
            element={
              <ContestListPage />
            }
          />
          <Route
            path="/contests/create"
            element={
              <RequireRole allowed={["AUTHOR", "ADMIN"]}>
                <ContestCreatePage />
              </RequireRole>
            }
          />

          <Route
            path="/contest/:id"
            element={
              <ContestLobbyAndRun />
            }
          />

          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewAssistant />
              </ProtectedRoute>
            }
          />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

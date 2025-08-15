import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginCard from "./pages/users/LoginCard";
import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage";  
import Dashboard from "./pages/dashboard/DashBoard";
import Problems from "./pages/users/problem";
import NavBar from "./components/NavBar";
import NewProblem from "./pages/admin/NewProblem";
import ProfileCard from "./pages/users/ProfileCard";
import ContestListPage from "./pages/ContestListPage";
import ContestCreatePage from "./pages/ContestCreatePage";
import ContestLobbyAndRun from "./pages/ContestLobbyAndRun";

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


          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <Problems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:id"
            element={
              <ProtectedRoute>
                <ProblemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:username"
            element={
              <ProtectedRoute>
                <ProfileCard />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <ContestCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contest/:id"
            element={
              <ProtectedRoute>
                <ContestLobbyAndRun />
              </ProtectedRoute>
            }
          />
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

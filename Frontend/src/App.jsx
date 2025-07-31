import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginCard from "./pages/users/LoginCard";
import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage.jsx";
import Dashboard from "./pages/dashboard/DashBoard";
import Problems from "./pages/users/problem";
import NavBar from "./component/NavBar";
import NewProblem from "./pages/admin/NewProblem";
import ProfileCard from "./pages/users/ProfileCard";

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("userId"); 
  return token ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignUpCard />} />
        {/* <Route path="/profile" element={<ProfileCard />} /> */}
        <Route
          path="/:username"
          element={<ProtectedRoute element={<ProfileCard />} />}
        />

        <Route
          path="/problems/:id"
          element={<ProtectedRoute element={<ProblemPage />} />}
        />
        <Route
          path="/newproblem"
          element={<ProtectedRoute element={<NewProblem />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/problems"
          element={<ProtectedRoute element={<Problems />} />}
        />
        <Route
          path="/"
          element={<ProtectedRoute element={<Problems />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
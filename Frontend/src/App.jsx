import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCard from "./pages/LoginCard";
import SignUpCard from './pages/SignUpCard';
import Dashboard from './pages/DashBoard';
import NewProblem from './pages/NewProblem';
import ProblemPage from './pages/ProblemPage';
import ProtectedRoute from './component/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignUpCard />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/new_problem" element={
          <ProtectedRoute>
            <NewProblem />
          </ProtectedRoute>
        } />
        <Route path="/problempage" element={
          <ProtectedRoute>
            <ProblemPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

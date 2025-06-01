import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCard from "./pages/LoginCard";
import SignUpCard from './pages/SignUpCard';
import DashBoard from './pages/DashBoard';
import NewProblem from './pages/NewProblem';
import ProblemPage from './pages/ProblemPage';
import ProtectedRoute from './component/ProtectedRoute';
import DashBoardTest from './pages/DashBoardTest';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignUpCard />} />
        <Route path="/dashtest" element={<DashBoardTest/>}/>
        <Route path="/" element={
          <ProtectedRoute>
            <DashBoard />
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

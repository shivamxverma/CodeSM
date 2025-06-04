import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCard from "./pages/users/LoginCard";
import SignUpCard from './pages/users/SignUpCard';
// import DashBoard from './pages/DashBoard';
// import NewProblem from './pages/NewProblem';
import ProblemPage from './pages/admin/ProblemPage';
// import ProtectedRoute from './component/ProtectedRoute';
import DashBoardTest from './pages/dashboard/DashBoardTest';
import Problems from './pages/users/problem';
import NewNav from './component/NewNav';

function App() {
  return (
    <BrowserRouter>
      <NewNav />
      <Routes>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignUpCard />} />
        <Route path="/dashtest" element={<DashBoardTest/>}/>
        <Route path="/problems" element={<Problems />} />

        {/* <Route path="/" element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        } />
        <Route path="/new_problem" element={
          <ProtectedRoute>
            <NewProblem />
          </ProtectedRoute>
        } />
        */}
        <Route path="/problempage" element={
          // <ProtectedRoute>
            <ProblemPage />
          // </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

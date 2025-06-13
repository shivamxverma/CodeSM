import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginCard from "./pages/users/LoginCard";
import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage.jsx";
import Dashboard from "./pages/dashboard/DashBoard";
import Problems from "./pages/users/problem";
import NavBar from "./component/NavBar";
import NewProblem from'./pages/admin/NewProblem'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/problempage" element={<ProblemPage />} />
        <Route path="/newproblem" element={<NewProblem />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignUpCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/" element={<Problems />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

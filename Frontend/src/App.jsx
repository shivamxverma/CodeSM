import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginCard from "./pages/users/LoginCard";
import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage";
import Dashboard from "./pages/dashboard/DashBoard";
import Problems from "./pages/users/problem";
import NewNav from "./component/NewNav";

function App() {
  return (
    <BrowserRouter>
      <NewNav />
      <Routes>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignUpCard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problempage" element={<ProblemPage />} />
        <Route path="/new_problem" element={<NewProblem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

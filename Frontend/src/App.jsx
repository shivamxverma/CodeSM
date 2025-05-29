import { BrowserRouter, Routes,Route } from 'react-router-dom'
import LoginCard from "./pages/LoginCard";
import SignUpCard from './pages/SignUpCard';
import Dashboard from './pages/DashBoard';
import NewProblem from './pages/NewProblem';
import ProblemPage from './pages/ProblemPage';

function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginCard/>} />
      <Route path="/signup" element={<SignUpCard/>} />
      <Route path="/" element={<Dashboard/>} />
      <Route path="/new_problem" element={<NewProblem/>} />
      <Route path="/problempage" element={<ProblemPage/>} />

    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
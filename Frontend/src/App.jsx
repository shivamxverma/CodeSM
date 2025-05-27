import { BrowserRouter, Routes,Route } from 'react-router-dom'
import LoginCard from "./pages/LoginCard";
import SignUpCard from './pages/SignUpCard';
import Dashboard from './pages/DashBoard';
import NewProblem from './pages/NewProblem';
function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginCard/>} />
      <Route path="/signup" element={<SignUpCard/>} />
      <Route path="/" element={<Dashboard/>} />
      <Route path="/problem" element={<NewProblem/>} />
    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
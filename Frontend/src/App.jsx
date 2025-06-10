import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LoginCard from "./pages/users/LoginCard";
// import SignUpCard from "./pages/users/SignUpCard";
import ProblemPage from "./pages/admin/ProblemPage.jsx";
// import Dashboard from "./pages/dashboard/DashBoard";
// import Problems from "./pages/users/problem";
// import NavBar from "./component/NavBar";
// import NewProblem from'./pages/admin/NewProblem'

function App() {
  return (

    // <>haan bhai kaise ho</>
    <BrowserRouter>
      {/* <NavBar /> */}
      <Routes>
        <Route path="/problempage" element={<ProblemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

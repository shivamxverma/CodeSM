import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";

export default function Layout() {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavBar />}
      <Outlet />
    </>
  );
}
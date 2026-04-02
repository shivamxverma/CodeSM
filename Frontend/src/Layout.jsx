import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";

export default function Layout() {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-dvh flex flex-col">
      {!hideNavbar && <NavBar />}
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

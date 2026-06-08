import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCsrfHeaders } from "../../../utils/csrf";
import "./Navbar.css";
interface NavbarProps {
  user: any;
  setUser: (user: any) => void;
}
const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to go based on the current path
  const isLoginPage = location.pathname === "/login";
  // const buttonText = isLoginPage ? "Register" : "Login";
  // const targetPath = isLoginPage ? "/signup" : "/login";

  const handleLogout = async () => {
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      headers: {
        ...getCsrfHeaders()
      },
      credentials: "include",
    });
    setUser(null); // Reset state to show "Login" button again
    navigate("/login");
  };

  return (
    <nav className="glass-nav">
      <div className="nav-container">
        <div className="company-logo" onClick={() => navigate("/")}>
          Our<span>Story</span>
        </div>

        {user ? (
          /* Show Logout if logged in */
          <button
            className="nav-action-btn logout-style"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          /* Otherwise, show your existing Login/Register toggle */
          <button
            className="nav-action-btn"
            onClick={() => navigate(isLoginPage ? "/signup" : "/login")}
          >
            {isLoginPage ? "Register" : "Login"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

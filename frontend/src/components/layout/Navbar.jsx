import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div>
        <span className="topbar-role">
          {user?.role === "admin" ? "HR Administration" : "Employee Portal"}
        </span>
      </div>

      <div className="date-box">
        <span>Today</span>
        <strong>{today}</strong>
      </div>
    </header>
  );
}

export default Navbar;
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();

  const employeeLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "▦" },
    { path: "/attendance", label: "Attendance", icon: "✓" },
    { path: "/leave", label: "Leave", icon: "□" },
    { path: "/payroll", label: "Payroll", icon: "₹" },
    { path: "/profile", label: "Profile", icon: "◎" },
  ];

  const adminLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "▦" },
    { path: "/employees", label: "Employees", icon: "♟" },
    { path: "/attendance", label: "Attendance", icon: "✓" },
    { path: "/leave-approvals", label: "Leave Approvals", icon: "□" },
    { path: "/payroll-control", label: "Payroll Control", icon: "₹" },
    { path: "/profile", label: "Profile", icon: "◎" },
  ];

  const links = user?.role === "admin" ? adminLinks : employeeLinks;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">D</div>

        <div>
          <div className="brand-title">Dayflow</div>
          <div className="brand-subtitle">Employee Management</div>
        </div>
      </div>

      <div className="sidebar-section-title">MAIN MENU</div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button" onClick={logout}>
          ↪ Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
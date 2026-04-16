import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "./Toast";
import { clearAuth } from "../utils/auth";
import './compoStyle/Sidebar.css'
const NAV = [
  { to: "/",         label: "Overview",       icon: "⊞" },
  { to: "/projects", label: "Projects",        icon: "◈" },
  { to: "/services", label: "Services",        icon: "◎" },
  { to: "/success",  label: "Wall of Success", icon: "★" },
    { to: "/contacts", label: "contacts",        icon: "✉" },
];


export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();


  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);


  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (!e.target.closest(".sidebar") && !e.target.closest(".hamburger")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [open]);

  const handleLogout = () => {
    clearAuth();
    toast.info("Logged out");
    navigate("/login");
  };

  return (
    <>
  
     <button
  className={`hamburger ${open ? "hidden" : ""}`}
  onClick={() => setOpen((p) => !p)}
>
  <span /><span /><span />
</button>


      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

     
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-logo">SKYFALL</div>
        <nav className="sb-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
            >
              <span className="sb-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <button className="sb-logout" onClick={handleLogout}>
            <span>⊗</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
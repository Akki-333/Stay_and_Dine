import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { UtensilsCrossed, User, LogOut, Bell } from "lucide-react";
import api from "../../src/config/api";
import { toast } from "react-toastify";
import "../styles/Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme: force single light theme (no user toggle). Keep layout simple and consistent.
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("theme");
  }, []);


  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn");
    if (stored === "true") {
      setIsLoggedIn(true);
      const currentRole = localStorage.getItem("role") || "";
      const userId = localStorage.getItem("userId");
      setUsername(localStorage.getItem("username") || "");
      setRole(currentRole);

      // Fetch Notifications
      if (userId) {
        api.get(`/user_notifications/${userId}`)
          .then(({ data }) => setNotifications(data))
          .catch(() => console.log("Failed to fetch notifications"));
      }

      // Notification Reminder
      if (currentRole !== "admin" && userId) {
        api.get(`/my_bookings/${userId}`)
          .then(({ data }) => {
            const activeBookings = Array.isArray(data) ? data.filter(b => String(b.user_id || b.userId) === String(userId) && new Date(b.booking_time) > new Date()) : [];
            if (activeBookings.length > 0) {
              const nextBooking = activeBookings.sort((a,b) => new Date(a.booking_time) - new Date(b.booking_time))[0];
              const timeString = new Date(nextBooking.booking_time).toLocaleString("en-IN", { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              toast.info(`🔔 Reminder: You have an upcoming table reservation on ${timeString}`, { autoClose: 6000, theme: "colored" });
            }
          }).catch(() => console.log("Failed to check bookings for notifications"));
      }
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    ["username", "isLoggedIn", "role", "userId"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/login");
  };

  const firstLetter = username ? username[0].toUpperCase() : "U";

  const navItems = (
    <>
      {role !== "admin" && (
        <>
          <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/booking-form" className={({ isActive }) => isActive ? "active" : ""}>Book a Table</NavLink></li>
          <li><NavLink to="/my-bookings" className={({ isActive }) => isActive ? "active" : ""}>My Bookings</NavLink></li>
        </>
      )}
      {isLoggedIn && role === "admin" && (
        <li><NavLink to="/admin_dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
      )}
      {isLoggedIn ? (
        <li className="nav-actions-li" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          
          {/* Notifications Bell */}
          <div className="nav-profile-wrapper" onMouseLeave={() => setShowNotifications(false)}>
            <div className="nav-profile-trigger" onClick={() => setShowNotifications(!showNotifications)}>
              <div className="nav-profile-circle" style={{ background: '#f1f5f9', color: '#475569' }}>
                <Bell size={18} />
                {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
              </div>
            </div>
            {showNotifications && (
              <div className="nav-profile-dropdown notif-dropdown" style={{ display: 'block', padding: '12px', minWidth: '280px', right: '-80px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f172a' }}>Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No new notifications</p>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', borderLeft: '3px solid #3b82f6' }}>
                        <span style={{ paddingRight: '8px' }}>{n.message}</span>
                        <button 
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                          onClick={() => {
                            api.delete(`/notifications/${n.id}`).catch(() => {});
                            setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                          }}
                        >
                          Mark as read
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="nav-profile-wrapper">
            <div className="nav-profile-trigger">
              <div className="nav-profile-circle">
                <User size={18} />
              </div>
              <span className="nav-profile-name">
                {username.toLowerCase() === "admin" ? "Admin" : username} 
                {role === "admin" && username.toLowerCase() !== "admin" && <span className="nav-badge">Admin</span>}
              </span>
            </div>
            <div className="nav-profile-dropdown">
              <button className="nav-dropdown-item nav-logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </li>
      ) : (
        <li className="nav-actions-li">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <NavLink to="/login" className="nav-btn nav-login-btn">
              Log In
            </NavLink>
          </div>
        </li>
      )}
    </>
  );

  return (
    <div className="layout-container">
      {/* ── NAVBAR ── */}
      <nav className={`custom-navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          {/* Brand */}
          <div className="nav-left">
            <a href="/" className="logo">
              <div className="logo-circle">
                <UtensilsCrossed size={20} className="logo-icon-svg" />
              </div>
              Stay<span>&amp;Dine</span>
            </a>
          </div>

          {/* Desktop nav */}
          <ul className="nav-links">{navItems}</ul>

          {/* Hamburger */}
          <button
            className={`hamburger-btn${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile nav */}
        <ul className={`mobile-nav${menuOpen ? " open" : ""}`}>{navItems}</ul>
      </nav>

      {/* ── CONTENT ── */}
      <main className="content">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="custom-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <h3>Stay&amp;Dine 🏨</h3>
              <p>
                {role === "admin" 
                  ? "Admin Portal — Manage reservations, oversee table arrangements, and update the menu catalog securely."
                  : "Your favorite local spot for great food and easy table reservations. Come hungry, leave happy."
                }
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                {role === "admin" ? (
                  <>
                    <li><a href="/admin_dashboard">Dashboard</a></li>
                    <li><a href="/table-management">Table Management</a></li>
                    <li><a href="/add-food">Menu Management</a></li>
                    <li><a href="/coupon-management">Coupons</a></li>
                  </>
                ) : (
                  <>
                    <li><a href="/">Home</a></li>
                    <li><a href="/booking-form">Book a Table</a></li>
                    <li><a href="/my-bookings">My Bookings</a></li>
                    <li><a href="/login">Login / Register</a></li>
                  </>
                )}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="#">📞 +91 98765 43210</a></li>
                <li><a href="#">✉️ support@stayanddine.com</a></li>
                <li><a href="#">📍 Mumbai, India</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Stay&amp;Dine. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
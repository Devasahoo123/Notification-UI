import { useCallback, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import SendPage from "./pages/SendPage";
import NotificationsPage from "./pages/NotificationsPage";
import ToastContainer from "./components/Toast";

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const showToast = useCallback((text, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const closeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="app">
      <header className="header">
        <h1>🔔 Notification System</h1>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            ✉️ Send
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            📋 Notifications
          </NavLink>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<SendPage showToast={showToast} />} />
        <Route path="/notifications" element={<NotificationsPage showToast={showToast} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
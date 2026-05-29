import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  // Read the user object stored in localStorage after login.
  // Before LoginPage is connected, this will be null → shows "User" placeholder.
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  const handleLogout = async () => {
    try {
      await logout(); // inform the backend (stateless, always returns success)
    } catch {
      // ignore — we clear the local session regardless
    }
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Brand / logo */}
      <div className="navbar-brand">
        <Link to="/dashboard">🏋️ Adaptive Bio-Coach</Link>
      </div>

      {/* Navigation links — pages not yet built will redirect to / via the catch-all route */}
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/workout-plans">Workout Plans</Link></li>
        <li><Link to="/workout-logs">Workout Logs</Link></li>
        <li><Link to="/meal-plans">Meal Plans</Link></li>
        <li><Link to="/check-ins">Check-ins</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>

      {/* User info and logout */}
      <div className="navbar-user">
        <span className="navbar-username">👤 {fullName}</span>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

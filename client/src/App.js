import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Pages — LoginPage has no Layout (full-screen design).
// The others will be added one by one in the next steps.
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

// Checks whether a user is stored in the browser from a previous login
const isLoggedIn = () => !!localStorage.getItem('user');

// ProtectedRoute: if not logged in → redirect to /
// if logged in → render the page wrapped in Layout (Navbar + content + Footer)
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no Navbar/Footer */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected — all wrapped in Layout automatically */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes for future pages — prevents Navbar links from crashing.
            Replace Navigate with real pages when they are built. */}
        <Route path="/workout-plans" element={<Navigate to="/dashboard" replace />} />
        <Route path="/meal-plans"    element={<Navigate to="/dashboard" replace />} />
        <Route path="/check-ins"     element={<Navigate to="/dashboard" replace />} />

        {/* Any unknown URL → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

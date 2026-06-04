import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getProfile } from './services/profileService';
import Layout from './components/Layout';

import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import OnboardingPage  from './pages/OnboardingPage';
import DashboardPage   from './pages/DashboardPage';
import SettingsPage    from './pages/SettingsPage';
import WorkoutPlansPage from './pages/WorkoutPlansPage';
import WorkoutLogsPage    from './pages/WorkoutLogsPage';
import WorkoutLoggerPage  from './pages/WorkoutLoggerPage';
import MealPlansPage    from './pages/MealPlansPage';
import CheckInsPage     from './pages/CheckInsPage';
import AdminPage        from './pages/AdminPage';

const isLoggedIn = () => !!localStorage.getItem('user');

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  useEffect(() => {
    // Restore saved theme
    const savedTheme = localStorage.getItem('theme');
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    // Session guard: if a user is in localStorage, verify they still exist in
    // the backend. A 401 or 404 means the session is stale (e.g. the backend
    // restarted and lost its in-memory user data). TypeErrors are network
    // failures — we leave those alone so a temporarily-down backend doesn't
    // log the user out.
    const raw = localStorage.getItem('user');
    if (!raw) return;

    let userId;
    try { userId = JSON.parse(raw).userId; }
    catch { localStorage.removeItem('user'); return; }

    getProfile(userId).catch((err) => {
      if (!(err instanceof TypeError)) {
        localStorage.removeItem('user');
        localStorage.removeItem('theme');
        window.location.replace('/');
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no Navbar/Footer */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected — all wrapped in Layout automatically */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />
        <Route
          path="/workout-plans"
          element={<ProtectedRoute><WorkoutPlansPage /></ProtectedRoute>}
        />
        <Route
          path="/workout-logs/new"
          element={<ProtectedRoute><WorkoutLoggerPage /></ProtectedRoute>}
        />
        <Route
          path="/workout-logs"
          element={<ProtectedRoute><WorkoutLogsPage /></ProtectedRoute>}
        />
        <Route
          path="/meal-plans"
          element={<ProtectedRoute><MealPlansPage /></ProtectedRoute>}
        />
        <Route
          path="/check-ins"
          element={<ProtectedRoute><CheckInsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute><AdminPage /></ProtectedRoute>}
        />

        {/* Any unknown URL → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

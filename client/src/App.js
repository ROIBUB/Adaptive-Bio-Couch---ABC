import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import SettingsPage    from './pages/SettingsPage';
import WorkoutPlansPage from './pages/WorkoutPlansPage';
import WorkoutLogsPage  from './pages/WorkoutLogsPage';
import MealPlansPage    from './pages/MealPlansPage';
import CheckInsPage     from './pages/CheckInsPage';

const isLoggedIn = () => !!localStorage.getItem('user');

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

        {/* Any unknown URL → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// The backend from Assignment 2 always runs on port 3000
const BASE_URL = 'http://localhost:3000';

// Reads the logged-in user from localStorage and builds the required headers.
// The backend checks:
//   x-user-role  → to decide if admin or regular user
//   x-user-id    → used by settings + users/me
//   userid       → used by workout-plans, workout-logs, daily-meal-plans, check-ins
const getAuthHeaders = () => {
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : {};
  return {
    'Content-Type': 'application/json',
    'x-user-role': user.userRole || '',
    'x-user-id': user.userId ? String(user.userId) : '',
    'userid': user.userId ? String(user.userId) : ''
  };
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('theme');
  window.location.replace('/');
};

// Generic fetch wrapper.
// - Merges auth headers into every request automatically.
// - Handles 401 globally: clears the stored session and redirects to login.
// - Reads the { success, data, error } envelope from the backend.
// - Throws an error (with the server's message) if success is false.
//   The thrown error has a `.status` property set to the HTTP status code
//   so callers can distinguish 404 (not found) from other failures.
const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    clearSessionAndRedirect();
    return;
  }

  const json = await response.json();

  if (!json.success) {
    const err = new Error(json.error?.message || 'Request failed');
    err.status = response.status;
    throw err;
  }

  return json.data;
};

export { BASE_URL, apiFetch, clearSessionAndRedirect };

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

// Generic fetch wrapper.
// - Merges auth headers into every request automatically.
// - Reads the { success, data, error } envelope from the backend.
// - Throws an error (with the server's message) if success is false.
//   This lets every caller just do: const data = await apiFetch('/api/...')
const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  return json.data;
};

export { BASE_URL, apiFetch };

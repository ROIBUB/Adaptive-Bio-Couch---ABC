import { BASE_URL } from './api';

// login does NOT use apiFetch because at login time there are no auth headers yet
const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'Login failed');
  }
  return json.data; // { userId, firstName, lastName, userRole, email }
};

const logout = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await response.json();
  return json.data;
};

const register = async (formData) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'Registration failed');
  }
  return json.data;
};

export { login, logout, register };

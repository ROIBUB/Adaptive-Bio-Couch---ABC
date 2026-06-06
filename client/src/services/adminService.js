import { apiFetch, BASE_URL } from './api';

// Users
const getAllUsers   = ()           => apiFetch('/api/users');
const deleteUser   = (id)         => apiFetch(`/api/users/${id}`, { method: 'DELETE' });
const updateUser   = (id, body)   => apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// Workout plans
const getAllWorkoutPlans  = ()       => apiFetch('/api/workout-plans');
const deleteWorkoutPlan  = (id)     => apiFetch(`/api/workout-plans/${id}`, { method: 'DELETE' });

// Meal plans
const getAllMealPlans     = ()       => apiFetch('/api/daily-meal-plans');
const deleteMealPlan     = (id)     => apiFetch(`/api/daily-meal-plans/${id}`, { method: 'DELETE' });

const createUserFull = async (formData) => {
  // Use auth/register so profile + plans are auto-generated
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const json = await response.json();
  if (!json.success) {
    const err = new Error(json.error?.message || 'Registration failed');
    err.status = response.status;
    throw err;
  }
  return json.data;
};

export { getAllUsers, deleteUser, updateUser, getAllWorkoutPlans, deleteWorkoutPlan, getAllMealPlans, deleteMealPlan, createUserFull };

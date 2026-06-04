import { apiFetch } from './api';

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

export { getAllUsers, deleteUser, updateUser, getAllWorkoutPlans, deleteWorkoutPlan, getAllMealPlans, deleteMealPlan };

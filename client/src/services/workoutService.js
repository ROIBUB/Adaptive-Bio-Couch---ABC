import { apiFetch } from './api';

// Backend filters by userid header automatically (regular users see only their own plans)
const getWorkoutPlans = () => apiFetch('/api/workout-plans');
const getWorkoutLogs  = () => apiFetch('/api/workout-logs');

export { getWorkoutPlans, getWorkoutLogs };

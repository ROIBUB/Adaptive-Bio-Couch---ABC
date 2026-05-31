import { apiFetch } from './api';

// Backend filters by userid header automatically (regular users see only their own plans)
const getWorkoutPlans    = () => apiFetch('/api/workout-plans');
const getWorkoutPlanById = (planId) => apiFetch(`/api/workout-plans/${planId}`);
const getWorkoutLogs = ({ workoutDayId = null, workoutPlanId = null } = {}) => {
  const params = new URLSearchParams();
  if (workoutDayId)  params.set('workoutDayId',  workoutDayId);
  if (workoutPlanId) params.set('workoutPlanId', workoutPlanId);
  const qs = params.toString();
  return apiFetch(qs ? `/api/workout-logs?${qs}` : '/api/workout-logs');
};
const createWorkoutLog   = (body) => apiFetch('/api/workout-logs', { method: 'POST', body: JSON.stringify(body) });

export { getWorkoutPlans, getWorkoutPlanById, getWorkoutLogs, createWorkoutLog };

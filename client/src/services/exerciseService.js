import { apiFetch } from './api';

// GET /api/exercises is a public endpoint — no auth required
const getAllExercises = () => apiFetch('/api/exercises');

export { getAllExercises };

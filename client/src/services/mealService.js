import { apiFetch } from './api';

const getDailyMealPlans = () => apiFetch('/api/daily-meal-plans');

export { getDailyMealPlans };

import { apiFetch } from './api';

const getDailyMealPlans    = () => apiFetch('/api/daily-meal-plans');
const getFoodAlternatives  = (foodItemId, grams) =>
  apiFetch(`/api/food-items/alternatives/${foodItemId}?grams=${grams}`);

export { getDailyMealPlans, getFoodAlternatives };

import { apiFetch } from './api';

const getAIRecommendations    = () => apiFetch('/api/ai/recommendations');
const generateAIRecommendations = () => apiFetch('/api/ai/recommendations', { method: 'POST' });

export { getAIRecommendations, generateAIRecommendations };

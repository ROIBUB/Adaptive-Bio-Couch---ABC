import { apiFetch } from './api';

const getProgressData  = ()         => apiFetch('/api/progress');
const createProgress   = (body)     => apiFetch('/api/progress', { method: 'POST', body: JSON.stringify(body) });
const updateProgress   = (id, body) => apiFetch(`/api/progress/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export { getProgressData, createProgress, updateProgress };

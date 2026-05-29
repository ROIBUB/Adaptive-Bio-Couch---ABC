import { apiFetch } from './api';

const getProfile    = (userId) => apiFetch(`/api/profiles/${userId}`);
const updateProfile = (userId, body) => apiFetch(`/api/profiles/${userId}`, { method: 'PUT', body: JSON.stringify(body) });

export { getProfile, updateProfile };

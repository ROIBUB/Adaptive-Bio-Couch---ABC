import { apiFetch } from './api';

const getCheckIns    = () => apiFetch('/api/check-ins');
const createCheckIn  = (body) => apiFetch('/api/check-ins', { method: 'POST', body: JSON.stringify(body) });

export { getCheckIns, createCheckIn };

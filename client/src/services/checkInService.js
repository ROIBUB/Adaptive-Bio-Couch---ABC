import { apiFetch } from './api';

const getCheckIns = () => apiFetch('/api/check-ins');

export { getCheckIns };

import { apiFetch } from './api';

const getMe = () => apiFetch('/api/users/me');

export { getMe };

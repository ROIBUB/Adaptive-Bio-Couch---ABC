import { apiFetch } from './api';

const getSettings = () => apiFetch('/api/settings');

const updateSettings = (data) =>
  apiFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });

export { getSettings, updateSettings };

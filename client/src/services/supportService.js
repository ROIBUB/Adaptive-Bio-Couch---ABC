import { apiFetch } from './api';

// User: fetch own conversation with all messages
export const getMyConversation = () =>
    apiFetch('/api/support/my-conversation');

// User: check if any admin/manager is currently online
export const getAdminsPresence = () =>
    apiFetch('/api/support/admins-presence');

// Admin/Manager: list all user conversations (with last message preview)
export const getAllUsersConversations = () =>
    apiFetch('/api/support/admin/users');

// Admin/Manager: fetch full conversation for a specific user
export const getUserConversation = (userId) =>
    apiFetch(`/api/support/admin/conversation/${userId}`);

const isAdminRole = (role) => role === 'admin' || role === 'manager';

module.exports = { isAdminRole };

const SettingsModel = require('../models/settings.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

// GET /api/settings
const getSettings = async (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        const settings = await SettingsModel.getByUserId(userId);

        if (!settings) {
            return sendSuccess(res, 200, {
                displayName: '', email: '', theme: 'light'
            });
        }

        return sendSuccess(res, 200, settings);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        if (!(await SettingsModel.getByUserId(userId))) {
            return sendNotFound(res, 'Settings not found for this user', {});
        }

        const { displayName, email, theme } = req.body;

        if (!displayName || !email || !theme) {
            return sendValidationError(res, 'displayName, email, and theme are required', {
                missingFields: [!displayName && 'displayName', !email && 'email', !theme && 'theme'].filter(Boolean)
            });
        }

        const updates = { displayName, email, theme };
        const updated = await SettingsModel.update(userId, updates);
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getSettings, updateSettings };

const SettingsModel = require('../models/settings.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

// GET /api/settings
const getSettings = (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        const settings = SettingsModel.getByUserId(userId);

        if (!settings) {
            return sendNotFound(res, 'Settings not found for this user', {});
        }

        return sendSuccess(res, 200, settings);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/settings
const updateSettings = (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        if (!SettingsModel.getByUserId(userId)) {
            return sendNotFound(res, 'Settings not found for this user', {});
        }

        const { displayName, email, theme, fitnessGoal, activityLevel } = req.body;

        if (!displayName || !email || !theme) {
            return sendValidationError(res, 'displayName, email, and theme are required', {
                missingFields: [!displayName && 'displayName', !email && 'email', !theme && 'theme'].filter(Boolean)
            });
        }

        const updates = { displayName, email, theme };
        if (fitnessGoal !== undefined) updates.fitnessGoal = fitnessGoal;
        if (activityLevel !== undefined) updates.activityLevel = activityLevel;

        const updated = SettingsModel.update(userId, updates);
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getSettings, updateSettings };

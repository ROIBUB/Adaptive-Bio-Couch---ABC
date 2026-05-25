const settingsModel = require('../models/settings.model');
const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

// GET /api/settings
// Returns the settings for the logged-in user (identified by x-user-id header).
const getSettings = (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        const settings = settingsModel.find(s => s.userId === userId);

        if (!settings) {
            return sendNotFound(res, 'Settings not found for this user', {});
        }

        return sendSuccess(res, 200, settings);

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/settings
// Updates the three required fields: displayName, email, theme.
// Also optionally updates fitnessGoal and activityLevel.
const updateSettings = (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        const settings = settingsModel.find(s => s.userId === userId);

        if (!settings) {
            return sendNotFound(res, 'Settings not found for this user', {});
        }

        const { displayName, email, theme, fitnessGoal, activityLevel } = req.body;

        if (!displayName || !email || !theme) {
            return sendValidationError(res, 'displayName, email, and theme are required', {
                missingFields: [
                    !displayName && 'displayName',
                    !email && 'email',
                    !theme && 'theme'
                ].filter(Boolean)
            });
        }

        settings.displayName = displayName;
        settings.email = email;
        settings.theme = theme;
        if (fitnessGoal !== undefined) settings.fitnessGoal = fitnessGoal;
        if (activityLevel !== undefined) settings.activityLevel = activityLevel;

        return sendSuccess(res, 200, settings);

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getSettings, updateSettings };

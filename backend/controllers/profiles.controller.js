const profiles = require('../models/profiles.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

// GET /api/profiles/:userId
const getProfileByUserId = (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!validateId(userId)) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId', value: req.params.userId });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== 'admin' && requestUserId !== userId) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const profile = profiles.find(p => p.userId === userId);

        if (!profile) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        return sendSuccess(res, 200, profile);

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/profiles
const createProfile = (req, res) => {
    try {
        const userId = parseInt(req.headers['userid']);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'Missing user id', { field: 'userid header' });
        }

        const requiredFields = ['fitnessGoal', 'workoutsPerWeek', 'mealsPerDay'];
        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required profile fields', { missingFields });
        }

        const {
            age, gender, height, currentWeight,
            targetWeight, fitnessGoal, activityLevel,
            workoutsPerWeek, mealsPerDay
        } = req.body;

        const existing = profiles.find(p => p.userId === userId);
        if (existing) {
            return sendValidationError(res, 'A profile already exists for this user', { userId });
        }

        const newProfile = {
            profileId: profiles.length > 0 ? profiles[profiles.length - 1].profileId + 1 : 1,
            userId,
            age: age ?? null,
            gender: gender ?? null,
            height: height ?? null,
            currentWeight: currentWeight ?? null,
            targetWeight: targetWeight ?? null,
            fitnessGoal,
            activityLevel: activityLevel ?? null,
            workoutsPerWeek,
            mealsPerDay,
            onboardingCompleted: false
        };

        profiles.push(newProfile);

        return sendSuccess(res, 201, newProfile);

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/profiles/:userId
const updateProfile = (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!validateId(userId)) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId', value: req.params.userId });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== 'admin' && requestUserId !== userId) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const profileIndex = profiles.findIndex(p => p.userId === userId);

        if (profileIndex === -1) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const {
            age, gender, height, currentWeight, targetWeight,
            fitnessGoal, activityLevel, workoutsPerWeek,
            mealsPerDay, onboardingCompleted
        } = req.body;

        const updated = { ...profiles[profileIndex] };

        if (age !== undefined)                updated.age = age;
        if (gender !== undefined)             updated.gender = gender;
        if (height !== undefined)             updated.height = height;
        if (currentWeight !== undefined)      updated.currentWeight = currentWeight;
        if (targetWeight !== undefined)       updated.targetWeight = targetWeight;
        if (fitnessGoal !== undefined)        updated.fitnessGoal = fitnessGoal;
        if (activityLevel !== undefined)      updated.activityLevel = activityLevel;
        if (workoutsPerWeek !== undefined)    updated.workoutsPerWeek = workoutsPerWeek;
        if (mealsPerDay !== undefined)        updated.mealsPerDay = mealsPerDay;
        if (onboardingCompleted !== undefined) updated.onboardingCompleted = onboardingCompleted;

        profiles[profileIndex] = updated;

        return sendSuccess(res, 200, profiles[profileIndex]);

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getProfileByUserId, createProfile, updateProfile };

const ProfilesModel = require('../models/profiles.model');

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

        const profile = ProfilesModel.getByUserId(userId);

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

        const missingFields = getMissingFields(req.body, ['fitnessGoal', 'workoutsPerWeek', 'mealsPerDay']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required profile fields', { missingFields });
        }

        if (ProfilesModel.getByUserId(userId)) {
            return sendValidationError(res, 'A profile already exists for this user', { userId });
        }

        const { age, gender, height, currentWeight, targetWeight, fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay } = req.body;

        const newProfile = ProfilesModel.create({
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
        });

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

        if (!ProfilesModel.getByUserId(userId)) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const {
            age, gender, height, currentWeight, targetWeight,
            fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay, onboardingCompleted
        } = req.body;

        const updates = {};
        if (age !== undefined)                updates.age = age;
        if (gender !== undefined)             updates.gender = gender;
        if (height !== undefined)             updates.height = height;
        if (currentWeight !== undefined)      updates.currentWeight = currentWeight;
        if (targetWeight !== undefined)       updates.targetWeight = targetWeight;
        if (fitnessGoal !== undefined)        updates.fitnessGoal = fitnessGoal;
        if (activityLevel !== undefined)      updates.activityLevel = activityLevel;
        if (workoutsPerWeek !== undefined)    updates.workoutsPerWeek = workoutsPerWeek;
        if (mealsPerDay !== undefined)        updates.mealsPerDay = mealsPerDay;
        if (onboardingCompleted !== undefined) updates.onboardingCompleted = onboardingCompleted;

        const updated = ProfilesModel.update(userId, updates);
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getProfileByUserId, createProfile, updateProfile };

const ProfilesModel      = require('../models/profiles.model');
const UsersModel         = require('../models/users.model');
const WorkoutPlansModel  = require('../models/workoutPlans.model');
const DailyMealPlansModel = require('../models/dailyMealPlans.model');
const ProgressDataModel  = require('../models/progressData.model');
const { generatePlan }   = require('../services/planGenerator');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/profiles/:userId
const getProfileByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!validateId(userId)) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId', value: req.params.userId });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && requestUserId !== userId) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const profile = await ProfilesModel.getByUserId(userId);

        if (!profile) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        return sendSuccess(res, 200, profile);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/profiles
const createProfile = async (req, res) => {
    try {
        const userId = parseInt(req.headers['userid']);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'Missing user id', { field: 'userid header' });
        }

        const missingFields = getMissingFields(req.body, ['fitnessGoal', 'workoutsPerWeek', 'mealsPerDay']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required profile fields', { missingFields });
        }

        if (await ProfilesModel.getByUserId(userId)) {
            return sendValidationError(res, 'A profile already exists for this user', { userId });
        }

        const { age, gender, height, currentWeight, targetWeight, fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay } = req.body;

        const newProfile = await ProfilesModel.create({
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
const updateProfile = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!validateId(userId)) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId', value: req.params.userId });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && requestUserId !== userId) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        if (!(await ProfilesModel.getByUserId(userId))) {
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

        const updated = await ProfilesModel.update(userId, updates);
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/profiles/:userId/replan
const replanProfile = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!validateId(userId)) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId', value: req.params.userId });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && requestUserId !== userId) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const profile = await ProfilesModel.getByUserId(userId);
        if (!profile) {
            return sendNotFound(res, 'Profile not found', { userId });
        }

        const missing = getMissingFields(req.body, ['fitnessGoal', 'activityLevel', 'workoutsPerWeek', 'mealsPerDay']);
        if (missing.length > 0) {
            return sendValidationError(res, 'Missing required replan fields', { missingFields: missing });
        }

        const { height, currentWeight, fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay } = req.body;

        const profileUpdates = { fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay };
        if (height !== undefined)        profileUpdates.height = Number(height);
        if (currentWeight !== undefined) profileUpdates.currentWeight = Number(currentWeight);

        const updatedProfile = await ProfilesModel.update(userId, profileUpdates);

        const user = await UsersModel.getById(userId);
        const firstName = user ? user.firstName : 'User';

        await WorkoutPlansModel.deactivateByUserId(userId);
        await DailyMealPlansModel.deactivateByUserId(userId);

        const plan = await generatePlan({ ...updatedProfile, userId, firstName });
        const finalProfile = await ProfilesModel.update(userId, plan);

        // Reset today's consumed calories so the old plan's eaten meals don't carry over
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = await ProgressDataModel.getByUserAndDate(userId, today);
        if (todayRecord) {
            await ProgressDataModel.update(todayRecord.progressId, {
                ...todayRecord,
                caloriesConsumed: 0
            });
        }

        return sendSuccess(res, 200, finalProfile);
    } catch (err) {
        console.error('Replan error:', err.message, err.stack);
        return sendServerError(res);
    }
};

module.exports = { getProfileByUserId, createProfile, updateProfile, replanProfile };

const UsersModel = require('../models/users.model');
const ProfilesModel = require('../models/profiles.model');
const { generatePlan } = require('../services/planGenerator');
const { sendSuccess, sendValidationError, sendServerError } = require('../middleware/errorHandlers');

// POST /api/auth/login
const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendValidationError(res, 'Email and password are required', {
                missingFields: [!email && 'email', !password && 'password'].filter(Boolean)
            });
        }

        const user = UsersModel.findByEmail(email);

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                data: null,
                error: { code: 'UNAUTHORIZED', message: 'Invalid email or password', details: {} }
            });
        }

        return sendSuccess(res, 200, {
            userId: user.userid,
            firstName: user.firstName,
            lastName: user.lastName,
            userRole: user.userRole,
            email: user.email
        });

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    return sendSuccess(res, 200, { message: 'Logged out successfully' });
};

// POST /api/auth/register
const register = (req, res) => {
    try {
        const {
            firstName, lastName, email, password,
            age, gender, height, weight,
            fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay
        } = req.body;

        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'age', 'gender', 'height', 'weight', 'fitnessGoal', 'activityLevel', 'workoutsPerWeek', 'mealsPerDay'];
        const missingFields = requiredFields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');

        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required fields', { missingFields });
        }

        const existing = UsersModel.findByEmail(email);
        if (existing) {
            return res.status(409).json({
                success: false,
                data: null,
                error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.', details: {} }
            });
        }

        const newUser = UsersModel.create({
            firstName, lastName, email, password,
            age, gender, height, weight,
            fitnessGoal, activityLevel,
            userRole: 'user',
            preferences: null
        });

        const newProfile = ProfilesModel.create({
            userId: newUser.userid,
            age, gender, height,
            currentWeight: weight,
            targetWeight: weight,
            fitnessGoal, activityLevel,
            workoutsPerWeek, mealsPerDay,
            onboardingCompleted: true
        });

        const plan = generatePlan({...newProfile, userId: newUser.userid, firstName: newUser.firstName });
        ProfilesModel.update(newProfile.userId, plan);

        return sendSuccess(res, 201, {
            userId: newUser.userid,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            userRole: newUser.userRole,
            caloricTarget: plan.caloricTarget
        });

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { login, logout, register };

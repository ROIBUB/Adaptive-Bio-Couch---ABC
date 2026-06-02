const UsersModel = require('../models/users.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError,
    sendForbidden
} = require('../middleware/errorHandlers');

const {
    validateId,
    getMissingFields,
    validatePositiveNumericFields
} = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/users
const getAllUsers = (req, res) => {
    try {
        return sendSuccess(res, 200, UsersModel.getAll());
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/users/:id
const getUserById = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid id', { field: 'id', value: req.params.id });
        }

        const user = UsersModel.getById(id);

        if (!user) {
            return sendNotFound(res, 'User not found', {});
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['x-user-id']);

        if (!isAdminRole(userRole) && requestUserId !== id) {
            return sendNotFound(res, 'User not found', {});
        }

        const { password, ...safeUser } = user;
        return sendSuccess(res, 200, safeUser);
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/users/me
const getMe = (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!validateId(userId)) {
            return sendValidationError(res, 'x-user-id header is required and must be a valid number', {});
        }

        const user = UsersModel.getById(userId);

        if (!user) {
            return sendNotFound(res, 'User not found', {});
        }

        const { password, ...safeUser } = user;
        return sendSuccess(res, 200, safeUser);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/users
const createUser = (req, res) => {
    try {
        const { firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal, preferences } = req.body;

        const missingFields = getMissingFields(req.body, ['firstName', 'lastName', 'userRole', 'age', 'gender', 'height', 'weight', 'activityLevel', 'fitnessGoal']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required user fields', { missingFields });
        }

        const invalidNumericFields = validatePositiveNumericFields(req.body, ['age', 'height', 'weight', 'activityLevel']);
        if (invalidNumericFields.length > 0) {
            return sendValidationError(res, 'Invalid numeric fields', { invalidFields: invalidNumericFields });
        }

        if (!['male', 'female'].includes(gender)) {
            return sendValidationError(res, 'Invalid gender', { field: 'gender', allowedValues: ['male', 'female'], value: gender });
        }

        if (!['user', 'admin'].includes(userRole)) {
            return sendValidationError(res, 'Invalid user role', { field: 'userRole', allowedValues: ['user', 'admin'], value: userRole });
        }

        const newUser = UsersModel.create({ firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal, preferences });
        return sendSuccess(res, 201, newUser);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/users/:id
const updateUser = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid id', { field: 'id', value: req.params.id });
        }

        if (!UsersModel.getById(id)) {
            return sendNotFound(res, 'User not found', {});
        }

        const { firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal, preferences } = req.body;

        const missingFields = getMissingFields(req.body, ['firstName', 'lastName', 'userRole', 'age', 'gender', 'height', 'weight', 'activityLevel', 'fitnessGoal']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required user fields', { missingFields });
        }

        const invalidNumericFields = validatePositiveNumericFields(req.body, ['age', 'height', 'weight', 'activityLevel']);
        if (invalidNumericFields.length > 0) {
            return sendValidationError(res, 'Invalid numeric fields', { invalidFields: invalidNumericFields });
        }

        if (!['male', 'female'].includes(gender)) {
            return sendValidationError(res, 'Invalid gender', { field: 'gender', allowedValues: ['male', 'female'], value: gender });
        }

        if (!['user', 'admin'].includes(userRole)) {
            return sendValidationError(res, 'Invalid user role', { field: 'userRole', allowedValues: ['user', 'admin'], value: userRole });
        }

        const updated = UsersModel.update(id, { firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal, preferences });
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/users/:id
const deleteUser = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid id', { field: 'id', value: req.params.id });
        }

        const deleted = UsersModel.remove(id);

        if (!deleted) {
            return sendNotFound(res, 'User not found', {});
        }

        return sendSuccess(res, 200, deleted);
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllUsers, getUserById, getMe, createUser, updateUser, deleteUser };

const WorkoutPlansModel = require('../models/workoutPlans.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/workout-plans
const getAllWorkoutPlans = (req, res) => {
    try {
        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (isAdminRole(userRole)) {
            return sendSuccess(res, 200, WorkoutPlansModel.getAll());
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        return sendSuccess(res, 200, WorkoutPlansModel.getByUserId(requestUserId));
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/workout-plans/:id
const getWorkoutPlanById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'id', value: req.params.id });
        }

        const plan = WorkoutPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        return sendSuccess(res, 200, plan);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/workout-plans
const createWorkoutPlan = (req, res) => {
    try {
        const userId = parseInt(req.headers['userid']);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'Missing user id', { field: 'userid header' });
        }

        const { name, goal, isActive } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'goal', 'isActive']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required workout plan fields', { missingFields });
        }

        if (typeof isActive !== 'boolean') {
            return sendValidationError(res, 'Invalid isActive value', { field: 'isActive', value: isActive });
        }

        const newPlan = WorkoutPlansModel.create({ userId, name, goal, isActive });
        return sendSuccess(res, 201, newPlan);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/workout-plans/:id
const updateWorkoutPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'id', value: req.params.id });
        }

        const plan = WorkoutPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const { name, goal, isActive } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'goal', 'isActive']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required workout plan fields', { missingFields });
        }

        if (typeof isActive !== 'boolean') {
            return sendValidationError(res, 'Invalid isActive value', { field: 'isActive', value: isActive });
        }

        const updated = WorkoutPlansModel.update(id, { name, goal, isActive });
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/workout-plans/:id
const deleteWorkoutPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'id', value: req.params.id });
        }

        const plan = WorkoutPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const deleted = WorkoutPlansModel.remove(id);
        return sendSuccess(res, 200, { workoutPlanId: deleted.workoutPlanId });
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllWorkoutPlans, getWorkoutPlanById, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan };

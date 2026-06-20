const WorkoutPlansModel = require('../../models/workoutPlans.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/workout-plans
const getAllWorkoutPlans = async (req, res) => {
    try {
        const requestUserId = Number(req.headers.userid);

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        return sendSuccess(res, 200, await WorkoutPlansModel.getByUserId(requestUserId));
    } catch (err) {
        console.error('[WorkoutPlans]', err);
        return sendServerError(res);
    }
};

// GET /api/workout-plans/:id
const getWorkoutPlanById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'id', value: req.params.id });
        }

        const plan = await WorkoutPlansModel.getById(id);

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
        console.error('[WorkoutPlans]', err);
        return sendServerError(res);
    }
};

// POST /api/workout-plans
const createWorkoutPlan = async (req, res) => {
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

        if (!['weight_loss', 'muscle_gain', 'maintenance'].includes(goal)) {
            return sendValidationError(res, 'Invalid goal value', {
                field: 'goal',
                allowedValues: ['weight_loss', 'muscle_gain', 'maintenance'],
                value: goal
            });
        }

        const newPlan = await WorkoutPlansModel.create({ userId, name, goal, isActive });
        return sendSuccess(res, 201, newPlan);
    } catch (err) {
        console.error('[WorkoutPlans]', err);
        return sendServerError(res);
    }
};

// PUT /api/workout-plans/:id
const updateWorkoutPlan = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'id', value: req.params.id });
        }

        const plan = await WorkoutPlansModel.getById(id);

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

        if (!['weight_loss', 'muscle_gain', 'maintenance'].includes(goal)) {
            return sendValidationError(res, 'Invalid goal value', {
                field: 'goal',
                allowedValues: ['weight_loss', 'muscle_gain', 'maintenance'],
                value: goal
            });
        }

        const updated = await WorkoutPlansModel.update(id, { name, goal, isActive });
        return sendSuccess(res, 200, updated);
    } catch (err) {
        console.error('[WorkoutPlans]', err);
        return sendServerError(res);
    }
};

// DELETE /api/workout-plans/:id
const deleteWorkoutPlan = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'id', value: req.params.id });
        }

        const plan = await WorkoutPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Workout plan not found', { workoutPlanId: id });
        }

        const deleted = await WorkoutPlansModel.remove(id);
        return sendSuccess(res, 200, { workoutPlanId: deleted.workoutPlanId });
    } catch (err) {
        console.error('[WorkoutPlans]', err);
        return sendServerError(res);
    }
};

module.exports = { getAllWorkoutPlans, getWorkoutPlanById, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan };

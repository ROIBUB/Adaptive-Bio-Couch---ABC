const ProgressDataModel = require('../../models/progressData.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/progress
const getAllProgress = async (req, res) => {
    try {
        const requestUserId = Number(req.headers.userid);

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        return sendSuccess(res, 200, await ProgressDataModel.getByUserId(requestUserId));
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/progress/:date
const getProgressByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const requestUserId = Number(req.headers.userid);

        if (!date) {
            return sendValidationError(res, 'Date is required', { field: 'date' });
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        const record = await ProgressDataModel.getByUserAndDate(requestUserId, date);

        if (!record) {
            return sendNotFound(res, 'Progress record not found', { date, userId: requestUserId });
        }

        return sendSuccess(res, 200, record);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/progress
const createProgress = async (req, res) => {
    try {
        const missingFields = getMissingFields(req.body, ['date', 'caloriesConsumed', 'workoutsCompleted', 'activeMinutes']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required progress fields', { missingFields });
        }

        const requestUserId = Number(req.headers.userid);
        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid' });
        }

        const { date, caloriesConsumed, workoutsCompleted, activeMinutes } = req.body;

        if (typeof caloriesConsumed !== 'number' || caloriesConsumed < 0) {
            return sendValidationError(res, 'Invalid calories consumed', { field: 'caloriesConsumed', value: caloriesConsumed });
        }

        if (typeof workoutsCompleted !== 'number' || workoutsCompleted < 0) {
            return sendValidationError(res, 'Invalid workouts completed', { field: 'workoutsCompleted', value: workoutsCompleted });
        }

        if (typeof activeMinutes !== 'number' || activeMinutes < 0) {
            return sendValidationError(res, 'Invalid active minutes', { field: 'activeMinutes', value: activeMinutes });
        }

        const newRecord = await ProgressDataModel.create({ userId: requestUserId, date, caloriesConsumed, workoutsCompleted, activeMinutes });
        return sendSuccess(res, 201, newRecord);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/progress/:id
const updateProgress = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const requestUserId = Number(req.headers.userid);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid progress id', { field: 'id', value: req.params.id });
        }

        const record = await ProgressDataModel.getById(id);

        if (!record) {
            return sendNotFound(res, 'Progress record not found', { progressId: id });
        }

        const userRole = req.headers['x-user-role'];
        if (!isAdminRole(userRole) && record.userId !== requestUserId) {
            return sendNotFound(res, 'Progress record not found', { progressId: id });
        }

        const missingFields = getMissingFields(req.body, ['date', 'caloriesConsumed', 'workoutsCompleted', 'activeMinutes']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required progress fields', { missingFields });
        }

        const { date, caloriesConsumed, workoutsCompleted, activeMinutes } = req.body;

        if (typeof caloriesConsumed !== 'number' || caloriesConsumed < 0) {
            return sendValidationError(res, 'Invalid calories consumed', { field: 'caloriesConsumed', value: caloriesConsumed });
        }

        if (typeof workoutsCompleted !== 'number' || workoutsCompleted < 0) {
            return sendValidationError(res, 'Invalid workouts completed', { field: 'workoutsCompleted', value: workoutsCompleted });
        }

        if (typeof activeMinutes !== 'number' || activeMinutes < 0) {
            return sendValidationError(res, 'Invalid active minutes', { field: 'activeMinutes', value: activeMinutes });
        }

        const updated = await ProgressDataModel.update(id, { date, caloriesConsumed, workoutsCompleted, activeMinutes });
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllProgress, getProgressByDate, createProgress, updateProgress };

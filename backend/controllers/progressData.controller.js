const progressData = require('../models/progressData.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

// GET /api/progress
const getAllProgress = (req, res) => {
    try {
        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (userRole === 'admin') {
            return sendSuccess(res, 200, progressData);
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', {
                field: 'userid',
                value: req.headers.userid || null
            });
        }

        const userProgress = progressData.filter(p => p.userId === requestUserId);

        return sendSuccess(res, 200, userProgress);

    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/progress/:date
const getProgressByDate = (req, res) => {
    try {
        const { date } = req.params;
        const requestUserId = Number(req.headers.userid);

        if (!date) {
            return sendValidationError(res, 'Date is required', { field: 'date' });
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', {
                field: 'userid',
                value: req.headers.userid || null
            });
        }

        const record = progressData.find(p => p.userId === requestUserId && p.date === date);

        if (!record) {
            return sendNotFound(res, 'Progress record not found', { date, userId: requestUserId });
        }

        return sendSuccess(res, 200, record);

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/progress
const createProgress = (req, res) => {
    try {
        const requiredFields = ['date', 'caloriesConsumed', 'workoutsCompleted', 'activeMinutes'];
        const missingFields = getMissingFields(req.body, requiredFields);

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

        const newRecord = {
            progressId: progressData.length > 0 ? progressData[progressData.length - 1].progressId + 1 : 1,
            userId: requestUserId,
            date,
            caloriesConsumed,
            workoutsCompleted,
            activeMinutes
        };

        progressData.push(newRecord);

        return sendSuccess(res, 201, newRecord);

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/progress/:id
const updateProgress = (req, res) => {
    try {
        const id = Number(req.params.id);
        const requestUserId = Number(req.headers.userid);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid progress id', { field: 'id', value: req.params.id });
        }

        const progressIndex = progressData.findIndex(p => p.progressId === id);

        if (progressIndex === -1) {
            return sendNotFound(res, 'Progress record not found', { progressId: id });
        }

        const userRole = req.headers['x-user-role'];
        if (userRole !== 'admin' && progressData[progressIndex].userId !== requestUserId) {
            return sendNotFound(res, 'Progress record not found', { progressId: id });
        }

        const requiredFields = ['date', 'caloriesConsumed', 'workoutsCompleted', 'activeMinutes'];
        const missingFields = getMissingFields(req.body, requiredFields);

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

        progressData[progressIndex] = {
            ...progressData[progressIndex],
            date,
            caloriesConsumed,
            workoutsCompleted,
            activeMinutes
        };

        return sendSuccess(res, 200, progressData[progressIndex]);

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllProgress, getProgressByDate, createProgress, updateProgress };

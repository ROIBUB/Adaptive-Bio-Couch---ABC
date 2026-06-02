const CheckInsModel = require('../models/checkIns.model');
const ProfilesModel = require('../models/profiles.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/check-ins
const getAllCheckIns = (req, res) => {
    try {
        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (isAdminRole(userRole)) {
            return sendSuccess(res, 200, CheckInsModel.getAll());
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        return sendSuccess(res, 200, CheckInsModel.getByUserId(requestUserId));
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/check-ins/:id
const getCheckInById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid check-in id', { field: 'id', value: req.params.id });
        }

        const checkIn = CheckInsModel.getById(id);

        if (!checkIn) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && checkIn.userId !== requestUserId) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        return sendSuccess(res, 200, checkIn);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/check-ins
const createCheckIn = (req, res) => {
    try {
        const missingFields = getMissingFields(req.body, ['checkInDate', 'weight', 'workoutsCompleted']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required check-in fields', { missingFields });
        }

        const requestUserId = Number(req.headers.userid);
        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid' });
        }

        const { checkInDate, weight, workoutsCompleted, feedback } = req.body;

        if (typeof weight !== 'number' || weight <= 0) {
            return sendValidationError(res, 'Invalid weight value', { field: 'weight', value: weight });
        }

        if (typeof workoutsCompleted !== 'number' || workoutsCompleted < 0) {
            return sendValidationError(res, 'Invalid workouts completed value', { field: 'workoutsCompleted', value: workoutsCompleted });
        }

        const newCheckIn = CheckInsModel.create({ userId: requestUserId, weight, workoutsCompleted, feedback, checkInDate });
        // Keep profile.currentWeight in sync so the dashboard reflects the latest weight
        ProfilesModel.update(requestUserId, { currentWeight: weight });
        return sendSuccess(res, 201, newCheckIn);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/check-ins/:id
const updateCheckIn = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid check-in id', { field: 'id', value: req.params.id });
        }

        const checkIn = CheckInsModel.getById(id);

        if (!checkIn) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && checkIn.userId !== requestUserId) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const missingFields = getMissingFields(req.body, ['checkInDate', 'weight', 'workoutsCompleted']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required check-in fields', { missingFields });
        }

        const { checkInDate, weight, workoutsCompleted, feedback } = req.body;

        if (typeof weight !== 'number' || weight <= 0) {
            return sendValidationError(res, 'Invalid weight value', { field: 'weight', value: weight });
        }

        if (typeof workoutsCompleted !== 'number' || workoutsCompleted < 0) {
            return sendValidationError(res, 'Invalid workouts completed value', { field: 'workoutsCompleted', value: workoutsCompleted });
        }

        const updated = CheckInsModel.update(id, { weight, workoutsCompleted, feedback, checkInDate });
        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/check-ins/:id
const deleteCheckIn = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid check-in id', { field: 'id', value: req.params.id });
        }

        const checkIn = CheckInsModel.getById(id);

        if (!checkIn) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && checkIn.userId !== requestUserId) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const deleted = CheckInsModel.remove(id);
        return sendSuccess(res, 200, { checkInId: deleted.checkInId });
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllCheckIns, getCheckInById, createCheckIn, updateCheckIn, deleteCheckIn };

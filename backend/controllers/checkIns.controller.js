const checkIns = require("../models/checkIns.model");

const {
    sendSuccess, sendValidationError, sendNotFound, sendServerError
} = require("../middleware/errorHandlers");

const { validateId, getMissingFields } = require("../middleware/validation");

// GET /api/check-ins
const getAllCheckIns = (req, res) => {
    try {
        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole === "admin") {
            return sendSuccess(res, 200, checkIns);
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(
                res,
                "Missing or invalid user id in request headers",
                { field: "userid", value: req.headers.userid || null }
            );
        }

        const userCheckIns = checkIns.filter(ci => ci.userId === requestUserId);

        return sendSuccess(res, 200, userCheckIns);

    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/check-ins/:id
const getCheckInById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, "Invalid check-in id", { field: "id", value: req.params.id });
        }

        const checkIn = checkIns.find(ci => ci.checkInId === id);

        if (!checkIn) {
            return sendNotFound(res, "Check-in not found", { checkInId: id });
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && checkIn.userId !== requestUserId) {
            return sendNotFound(res, "Check-in not found", { checkInId: id });
        }

        return sendSuccess(res, 200, checkIn);

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/check-ins
const createCheckIn = (req, res) => {
    try {
        const requiredFields = ["checkInDate", "weight", "workoutsCompleted"];
        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(res, "Missing required check-in fields", { missingFields });
        }

        const { checkInDate, weight, workoutsCompleted, feedback } = req.body;

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (!validateId(requestUserId)) {
            return sendValidationError(res, "Missing or invalid user id in request headers", { field: "userid" });
        }

        if (typeof weight !== "number" || weight <= 0) {
            return sendValidationError(res, "Invalid weight value", { field: "weight", value: weight });
        }

        if (typeof workoutsCompleted !== "number" || workoutsCompleted < 0) {
            return sendValidationError(res, "Invalid workouts completed value", { field: "workoutsCompleted", value: workoutsCompleted });
        }

        const newCheckIn = {
            checkInId: checkIns.length > 0 ? checkIns[checkIns.length - 1].checkInId + 1 : 1,
            userId: requestUserId,
            weight,
            workoutsCompleted,
            feedback: feedback || "",
            checkInDate
        };

        checkIns.push(newCheckIn);

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
            return sendValidationError(res, "Invalid check-in id", { field: "id", value: req.params.id });
        }

        const checkInIndex = checkIns.findIndex(ci => ci.checkInId === id);

        if (checkInIndex === -1) {
            return sendNotFound(res, "Check-in not found", { checkInId: id });
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && checkIns[checkInIndex].userId !== requestUserId) {
            return sendNotFound(res, "Check-in not found", { checkInId: id });
        }

        const requiredFields = ["checkInDate", "weight", "workoutsCompleted"];
        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(res, "Missing required check-in fields", { missingFields });
        }

        const { checkInDate, weight, workoutsCompleted, feedback } = req.body;

        if (typeof weight !== "number" || weight <= 0) {
            return sendValidationError(res, "Invalid weight value", { field: "weight", value: weight });
        }

        if (typeof workoutsCompleted !== "number" || workoutsCompleted < 0) {
            return sendValidationError(res, "Invalid workouts completed value", { field: "workoutsCompleted", value: workoutsCompleted });
        }

        checkIns[checkInIndex] = {
            checkInId: id,
            userId: checkIns[checkInIndex].userId,
            weight,
            workoutsCompleted,
            feedback: feedback || "",
            checkInDate
        };

        return sendSuccess(res, 200, checkIns[checkInIndex]);

    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/check-ins/:id
const deleteCheckIn = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, "Invalid check-in id", { field: "id", value: req.params.id });
        }

        const checkInIndex = checkIns.findIndex(ci => ci.checkInId === id);

        if (checkInIndex === -1) {
            return sendNotFound(res, "Check-in not found", { checkInId: id });
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && checkIns[checkInIndex].userId !== requestUserId) {
            return sendNotFound(res, "Check-in not found", { checkInId: id });
        }

        const deletedCheckIn = checkIns.splice(checkInIndex, 1)[0];

        return sendSuccess(res, 200, { checkInId: deletedCheckIn.checkInId });

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = {
    getAllCheckIns,
    getCheckInById,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn
};

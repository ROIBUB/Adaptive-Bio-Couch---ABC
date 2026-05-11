const checkIns = require("../models/checkIns.model");

const {
    sendSuccess, sendValidationError, sendForbidden, sendNotFound, sendServerError} = require("../middleware/errorHandlers");

const {validateId, getMissingFields} = require("../middleware/validation");

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
                {
                    field: "userid",
                    value: req.headers.userid || null
                }
            );
        }

        const userCheckIns = checkIns.filter(
            checkIn => checkIn.userId === requestUserId
        );

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
            return sendValidationError(
                res,
                "Invalid check-in id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const checkIn = checkIns.find(
            item => item.checkInId === id
        );

        if (!checkIn) {
            return sendNotFound(
                res,
                "Check-in not found",
                {
                    checkInId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (
            userRole !== "admin" &&
            checkIn.userId !== requestUserId
        ) {
            return sendForbidden(
                res,
                "You are not allowed to access this check-in",
                {
                    requiredOwnerUserId: checkIn.userId,
                    requestUserId: isNaN(requestUserId)
                        ? null
                        : requestUserId,
                    role: userRole || null
                }
            );
        }

        return sendSuccess(res, 200, checkIn);

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/check-ins
const createCheckIn = (req, res) => {
    try {
        const {userId, date, currentWeight, nutritionDeviation, deviationFrequency, hungerLevel,
            energyLevel, generalFeedback, recommendationSummary} = req.body;

        const requiredFields = ["userId", "date", "currentWeight", "nutritionDeviation",
            "deviationFrequency", "hungerLevel", "energyLevel"];

        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required check-in fields",
                {
                    missingFields: missingFields
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (
            userRole !== "admin" &&
            userId !== requestUserId
        ) {
            return sendForbidden(
                res,
                "You are not allowed to create a check-in for another user",
                {
                    bodyUserId: userId,
                    requestUserId: isNaN(requestUserId)
                        ? null
                        : requestUserId,
                    role: userRole || null
                }
            );
        }

        if (typeof userId !== "number" || userId <= 0) {
            return sendValidationError(
                res,
                "Invalid user id",
                {
                    field: "userId",
                    value: userId
                }
            );
        }

        if (typeof currentWeight !== "number" || currentWeight <= 0) {
            return sendValidationError(
                res,
                "Invalid current weight",
                {
                    field: "currentWeight",
                    value: currentWeight
                }
            );
        }

        const allowedNutritionDeviation = ["none", "small", "moderate", "large"];

        if (!allowedNutritionDeviation.includes(
                nutritionDeviation
            )
        ) {
            return sendValidationError(
                res,
                "Invalid nutrition deviation value",
                {
                    field: "nutritionDeviation",
                    allowedValues: allowedNutritionDeviation,
                    value: nutritionDeviation
                }
            );
        }

        if (typeof deviationFrequency !== "number" ||
            deviationFrequency < 0
        ) {
            return sendValidationError(
                res,
                "Invalid deviation frequency",
                {
                    field: "deviationFrequency",
                    value: deviationFrequency
                }
            );
        }

        const allowedLevels = ["low", "medium", "high"];

        if (!allowedLevels.includes(hungerLevel)) {
            return sendValidationError(
                res,
                "Invalid hunger level",
                {
                    field: "hungerLevel",
                    allowedValues: allowedLevels,
                    value: hungerLevel
                }
            );
        }

        if (!allowedLevels.includes(energyLevel)) {
            return sendValidationError(
                res,
                "Invalid energy level",
                {
                    field: "energyLevel",
                    allowedValues: allowedLevels,
                    value: energyLevel
                }
            );
        }

        const newCheckIn = {checkInId: checkIns.length > 0 ? checkIns[checkIns.length - 1].checkInId + 1 : 1,
            userId, date, currentWeight, nutritionDeviation, deviationFrequency, hungerLevel, energyLevel,
            generalFeedback: generalFeedback || "", recommendationSummary: recommendationSummary || ""};

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
            return sendValidationError(
                res,
                "Invalid check-in id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const checkInIndex = checkIns.findIndex(
            item => item.checkInId === id
        );

        if (checkInIndex === -1) {
            return sendNotFound(
                res,
                "Check-in not found",
                {
                    checkInId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" &&
            checkIns[checkInIndex].userId !== requestUserId
        ) {
            return sendForbidden(
                res,
                "You are not allowed to update this check-in",
                {
                    requiredOwnerUserId:
                    checkIns[checkInIndex].userId,
                    requestUserId: isNaN(requestUserId)
                        ? null
                        : requestUserId,
                    role: userRole || null
                }
            );
        }

        const {userId, date, currentWeight, nutritionDeviation, deviationFrequency, hungerLevel,
            energyLevel, generalFeedback, recommendationSummary} = req.body;

        const requiredFields = ["userId", "date", "currentWeight", "nutritionDeviation", "deviationFrequency",
            "hungerLevel", "energyLevel"];

        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required check-in fields",
                {
                    missingFields: missingFields
                }
            );
        }

        if (userRole !== "admin" &&
            userId !== requestUserId
        ) {
            return sendForbidden(
                res,
                "You are not allowed to change the user id of this check-in",
                {
                    bodyUserId: userId,
                    requestUserId: isNaN(requestUserId)
                        ? null
                        : requestUserId,
                    role: userRole || null
                }
            );
        }

        if (typeof userId !== "number" ||
            userId <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid user id",
                {
                    field: "userId",
                    value: userId
                }
            );
        }

        if (typeof currentWeight !== "number" ||
            currentWeight <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid current weight",
                {
                    field: "currentWeight",
                    value: currentWeight
                }
            );
        }

        const allowedNutritionDeviation = ["none", "small", "moderate", "large"];

        if (
            !allowedNutritionDeviation.includes(
                nutritionDeviation
            )
        ) {
            return sendValidationError(
                res,
                "Invalid nutrition deviation value",
                {
                    field: "nutritionDeviation",
                    allowedValues: allowedNutritionDeviation,
                    value: nutritionDeviation
                }
            );
        }

        if (
            typeof deviationFrequency !== "number" ||
            deviationFrequency < 0
        ) {
            return sendValidationError(
                res,
                "Invalid deviation frequency",
                {
                    field: "deviationFrequency",
                    value: deviationFrequency
                }
            );
        }

        const allowedLevels = ["low", "medium", "high"];

        if (!allowedLevels.includes(hungerLevel)) {
            return sendValidationError(
                res,
                "Invalid hunger level",
                {
                    field: "hungerLevel",
                    allowedValues: allowedLevels,
                    value: hungerLevel
                }
            );
        }

        if (!allowedLevels.includes(energyLevel)) {
            return sendValidationError(
                res,
                "Invalid energy level",
                {
                    field: "energyLevel",
                    allowedValues: allowedLevels,
                    value: energyLevel
                }
            );
        }

        checkIns[checkInIndex] = {checkInId: id, userId, date, currentWeight, nutritionDeviation, deviationFrequency,
            hungerLevel, energyLevel, generalFeedback: generalFeedback || "", recommendationSummary:
                recommendationSummary || ""};

        return sendSuccess(
            res,
            200,
            checkIns[checkInIndex]
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/check-ins/:id
const deleteCheckIn = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid check-in id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const checkInIndex = checkIns.findIndex(
            item => item.checkInId === id
        );

        if (checkInIndex === -1) {
            return sendNotFound(
                res,
                "Check-in not found",
                {
                    checkInId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (
            userRole !== "admin" &&
            checkIns[checkInIndex].userId !== requestUserId
        ) {
            return sendForbidden(
                res,
                "You are not allowed to delete this check-in",
                {
                    requiredOwnerUserId:
                    checkIns[checkInIndex].userId,
                    requestUserId: isNaN(requestUserId)
                        ? null
                        : requestUserId,
                    role: userRole || null
                }
            );
        }

        const deletedCheckIn = checkIns.splice(checkInIndex, 1)[0];

        return sendSuccess(
            res,
            200,
            {
                checkInId: deletedCheckIn.checkInId
            }
        );

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
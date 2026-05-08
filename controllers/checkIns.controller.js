const checkIns = require("../models/checkIns.model");

// GET /api/check-ins
const getAllCheckIns = (req, res) => {
    try {
        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole === "admin") {
            return res.status(200).json({
                success: true,
                data: checkIns,
                error: null
            });
        }

        if (isNaN(requestUserId)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing or invalid user id in request headers",
                    details: {
                        field: "userid",
                        value: req.headers.userid || null
                    }
                }
            });
        }

        const userCheckIns = checkIns.filter(checkIn => checkIn.userId === requestUserId);

        res.status(200).json({
            success: true,
            data: userCheckIns,
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// GET /api/check-ins/:id
const getCheckInById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid check-in id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const checkIn = checkIns.find(item => item.checkInId === id);

        if (!checkIn) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Check-in not found",
                    details: {
                        checkInId: id
                    }
                }
            });
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && checkIn.userId !== requestUserId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You are not allowed to access this check-in",
                    details: {
                        requiredOwnerUserId: checkIn.userId,
                        requestUserId: isNaN(requestUserId) ? null : requestUserId,
                        role: userRole || null
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: checkIn,
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// POST /api/check-ins
const createCheckIn = (req, res) => {
    try {
        const {
            userId,
            date,
            currentWeight,
            nutritionDeviation,
            deviationFrequency,
            hungerLevel,
            energyLevel,
            generalFeedback,
            recommendationSummary
        } = req.body;

        const requiredFields = [
            "userId",
            "date",
            "currentWeight",
            "nutritionDeviation",
            "deviationFrequency",
            "hungerLevel",
            "energyLevel"
        ];

        const missingFields = requiredFields.filter(field =>
            req.body[field] === undefined || req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required check-in fields",
                    details: {
                        missingFields: missingFields
                    }
                }
            });
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && userId !== requestUserId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You are not allowed to create a check-in for another user",
                    details: {
                        bodyUserId: userId,
                        requestUserId: isNaN(requestUserId) ? null : requestUserId,
                        role: userRole || null
                    }
                }
            });
        }

        if (typeof userId !== "number" || userId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid user id",
                    details: {
                        field: "userId",
                        value: userId
                    }
                }
            });
        }

        if (typeof currentWeight !== "number" || currentWeight <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid current weight",
                    details: {
                        field: "currentWeight",
                        value: currentWeight
                    }
                }
            });
        }

        const allowedNutritionDeviation = ["none", "small", "moderate", "large"];
        if (!allowedNutritionDeviation.includes(nutritionDeviation)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid nutrition deviation value",
                    details: {
                        field: "nutritionDeviation",
                        allowedValues: allowedNutritionDeviation,
                        value: nutritionDeviation
                    }
                }
            });
        }

        if (typeof deviationFrequency !== "number" || deviationFrequency < 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid deviation frequency",
                    details: {
                        field: "deviationFrequency",
                        value: deviationFrequency
                    }
                }
            });
        }

        const allowedLevels = ["low", "medium", "high"];

        if (!allowedLevels.includes(hungerLevel)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid hunger level",
                    details: {
                        field: "hungerLevel",
                        allowedValues: allowedLevels,
                        value: hungerLevel
                    }
                }
            });
        }

        if (!allowedLevels.includes(energyLevel)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid energy level",
                    details: {
                        field: "energyLevel",
                        allowedValues: allowedLevels,
                        value: energyLevel
                    }
                }
            });
        }

        const newCheckIn = {
            checkInId: checkIns.length > 0
                ? checkIns[checkIns.length - 1].checkInId + 1
                : 1,
            userId,
            date,
            currentWeight,
            nutritionDeviation,
            deviationFrequency,
            hungerLevel,
            energyLevel,
            generalFeedback: generalFeedback || "",
            recommendationSummary: recommendationSummary || ""
        };

        checkIns.push(newCheckIn);

        res.status(201).json({
            success: true,
            data: newCheckIn,
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// PUT /api/check-ins/:id
const updateCheckIn = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid check-in id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const checkInIndex = checkIns.findIndex(item => item.checkInId === id);

        if (checkInIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Check-in not found",
                    details: {
                        checkInId: id
                    }
                }
            });
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && checkIns[checkInIndex].userId !== requestUserId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You are not allowed to update this check-in",
                    details: {
                        requiredOwnerUserId: checkIns[checkInIndex].userId,
                        requestUserId: isNaN(requestUserId) ? null : requestUserId,
                        role: userRole || null
                    }
                }
            });
        }

        const {
            userId,
            date,
            currentWeight,
            nutritionDeviation,
            deviationFrequency,
            hungerLevel,
            energyLevel,
            generalFeedback,
            recommendationSummary
        } = req.body;

        const requiredFields = [
            "userId",
            "date",
            "currentWeight",
            "nutritionDeviation",
            "deviationFrequency",
            "hungerLevel",
            "energyLevel"
        ];

        const missingFields = requiredFields.filter(field =>
            req.body[field] === undefined || req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required check-in fields",
                    details: {
                        missingFields: missingFields
                    }
                }
            });
        }

        if (userRole !== "admin" && userId !== requestUserId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You are not allowed to change the user id of this check-in",
                    details: {
                        bodyUserId: userId,
                        requestUserId: isNaN(requestUserId) ? null : requestUserId,
                        role: userRole || null
                    }
                }
            });
        }

        if (typeof userId !== "number" || userId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid user id",
                    details: {
                        field: "userId",
                        value: userId
                    }
                }
            });
        }

        if (typeof currentWeight !== "number" || currentWeight <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid current weight",
                    details: {
                        field: "currentWeight",
                        value: currentWeight
                    }
                }
            });
        }

        const allowedNutritionDeviation = ["none", "small", "moderate", "large"];
        if (!allowedNutritionDeviation.includes(nutritionDeviation)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid nutrition deviation value",
                    details: {
                        field: "nutritionDeviation",
                        allowedValues: allowedNutritionDeviation,
                        value: nutritionDeviation
                    }
                }
            });
        }

        if (typeof deviationFrequency !== "number" || deviationFrequency < 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid deviation frequency",
                    details: {
                        field: "deviationFrequency",
                        value: deviationFrequency
                    }
                }
            });
        }

        const allowedLevels = ["low", "medium", "high"];

        if (!allowedLevels.includes(hungerLevel)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid hunger level",
                    details: {
                        field: "hungerLevel",
                        allowedValues: allowedLevels,
                        value: hungerLevel
                    }
                }
            });
        }

        if (!allowedLevels.includes(energyLevel)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid energy level",
                    details: {
                        field: "energyLevel",
                        allowedValues: allowedLevels,
                        value: energyLevel
                    }
                }
            });
        }

        checkIns[checkInIndex] = {
            checkInId: id,
            userId,
            date,
            currentWeight,
            nutritionDeviation,
            deviationFrequency,
            hungerLevel,
            energyLevel,
            generalFeedback: generalFeedback || "",
            recommendationSummary: recommendationSummary || ""
        };

        res.status(200).json({
            success: true,
            data: checkIns[checkInIndex],
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// DELETE /api/check-ins/:id
const deleteCheckIn = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid check-in id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const checkInIndex = checkIns.findIndex(item => item.checkInId === id);

        if (checkInIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Check-in not found",
                    details: {
                        checkInId: id
                    }
                }
            });
        }

        const userRole = req.headers.role;
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && checkIns[checkInIndex].userId !== requestUserId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You are not allowed to delete this check-in",
                    details: {
                        requiredOwnerUserId: checkIns[checkInIndex].userId,
                        requestUserId: isNaN(requestUserId) ? null : requestUserId,
                        role: userRole || null
                    }
                }
            });
        }

        const deletedCheckIn = checkIns.splice(checkInIndex, 1)[0];

        res.status(200).json({
            success: true,
            data: {
                checkInId: deletedCheckIn.checkInId
            },
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

module.exports = {
    getAllCheckIns,
    getCheckInById,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn
};
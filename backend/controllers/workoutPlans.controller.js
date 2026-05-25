const workoutPlans = require("../models/workoutPlans.model");

const {
    sendSuccess,
    sendValidationError,
    sendForbidden,
    sendNotFound,
    sendServerError
} = require("../middleware/errorHandlers");

const {
    validateId,
    getMissingFields
} = require("../middleware/validation");

// GET /api/workout-plans
const getAllWorkoutPlans = (req, res) => {
    try {

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        // admin gets all workout plans
        if (userRole === "admin") {
            return sendSuccess(
                res,
                200,
                workoutPlans
            );
        }

        // invalid userid
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

        // regular user gets only his plans
        const userWorkoutPlans =
            workoutPlans.filter(
                plan => plan.userId === requestUserId
            );

        return sendSuccess(
            res,
            200,
            userWorkoutPlans
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/workout-plans/:id
const getWorkoutPlanById = (req, res) => {
    try {

        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid workout plan id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const workoutPlan =
            workoutPlans.find(
                plan => plan.workoutPlanId === id
            );

        if (!workoutPlan) {
            return sendNotFound(
                res,
                "Workout plan not found",
                {
                    workoutPlanId: id
                }
            );
        }

        const userRole =
            req.headers["x-user-role"];

        const requestUserId =
            Number(req.headers.userid);

        // regular user can access only his own workout plan
        if (
            userRole !== "admin" &&
            workoutPlan.userId !== requestUserId
        ) {
            return sendForbidden(
                res,
                "You are not allowed to access this workout plan",
                {
                    requiredOwnerUserId:
                    workoutPlan.userId,
                    requestUserId:
                    requestUserId
                }
            );
        }

        return sendSuccess(
            res,
            200,
            workoutPlan
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/workout-plans
const createWorkoutPlan = (req, res) => {
    try {

        const {
            userId,
            name,
            goal,
            isActive,
            days
        } = req.body;

        const requiredFields = [
            "userId",
            "name",
            "goal",
            "isActive",
            "days"
        ];

        const missingFields =
            getMissingFields(
                req.body,
                requiredFields
            );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required workout plan fields",
                {
                    missingFields:
                    missingFields
                }
            );
        }

        if (
            typeof userId !== "number" ||
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

        if (typeof isActive !== "boolean") {
            return sendValidationError(
                res,
                "Invalid isActive value",
                {
                    field: "isActive",
                    value: isActive
                }
            );
        }

        if (
            !Array.isArray(days) ||
            days.length === 0
        ) {
            return sendValidationError(
                res,
                "Days must be a non-empty array",
                {
                    field: "days"
                }
            );
        }

        const invalidDays = [];

        days.forEach(
            (dayItem, dayIndex) => {

                if (!dayItem.day) {
                    invalidDays.push({
                        index: dayIndex,
                        field: "day"
                    });
                }

                if (!dayItem.title) {
                    invalidDays.push({
                        index: dayIndex,
                        field: "title"
                    });
                }

                if (
                    !Array.isArray(dayItem.exercises) ||
                    dayItem.exercises.length === 0
                ) {
                    invalidDays.push({
                        index: dayIndex,
                        field: "exercises"
                    });
                }
            }
        );

        if (invalidDays.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout days structure",
                {
                    invalidDays:
                    invalidDays
                }
            );
        }

        const invalidExercises = [];

        days.forEach(
            (dayItem, dayIndex) => {

                if (
                    Array.isArray(
                        dayItem.exercises
                    )
                ) {

                    dayItem.exercises.forEach(
                        (
                            exercise,
                            exerciseIndex
                        ) => {

                            if (
                                typeof exercise.exerciseId !== "number" ||
                                exercise.exerciseId <= 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "exerciseId",
                                    value:
                                    exercise.exerciseId
                                });
                            }

                            if (
                                !exercise.exerciseName
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "exerciseName"
                                });
                            }

                            if (
                                typeof exercise.targetSets !== "number" ||
                                exercise.targetSets <= 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "targetSets",
                                    value:
                                    exercise.targetSets
                                });
                            }

                            if (
                                typeof exercise.targetReps !== "number" ||
                                exercise.targetReps <= 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "targetReps",
                                    value:
                                    exercise.targetReps
                                });
                            }

                            if (
                                typeof exercise.targetWeight !== "number" ||
                                exercise.targetWeight < 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "targetWeight",
                                    value:
                                    exercise.targetWeight
                                });
                            }
                        }
                    );
                }
            }
        );

        if (invalidExercises.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout plan exercises",
                {
                    invalidExercises:
                    invalidExercises
                }
            );
        }

        const newWorkoutPlan = {
            workoutPlanId:
                workoutPlans.length > 0
                    ? workoutPlans[
                workoutPlans.length - 1
                    ].workoutPlanId + 1
                    : 1,
            userId,
            name,
            goal,
            isActive,
            days,
            createdAt:
                new Date()
                    .toISOString()
                    .split("T")[0]
        };

        workoutPlans.push(
            newWorkoutPlan
        );

        return sendSuccess(
            res,
            201,
            newWorkoutPlan
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/workout-plans/:id
const updateWorkoutPlan = (req, res) => {
    try {

        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid workout plan id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const workoutPlanIndex =
            workoutPlans.findIndex(
                plan =>
                    plan.workoutPlanId === id
            );

        if (workoutPlanIndex === -1) {
            return sendNotFound(
                res,
                "Workout plan not found",
                {
                    workoutPlanId: id
                }
            );
        }

        const {
            userId,
            name,
            goal,
            isActive,
            days
        } = req.body;

        const requiredFields = [
            "userId",
            "name",
            "goal",
            "isActive",
            "days"
        ];

        const missingFields =
            getMissingFields(
                req.body,
                requiredFields
            );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required workout plan fields",
                {
                    missingFields:
                    missingFields
                }
            );
        }

        if (
            typeof userId !== "number" ||
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

        if (typeof isActive !== "boolean") {
            return sendValidationError(
                res,
                "Invalid isActive value",
                {
                    field: "isActive",
                    value: isActive
                }
            );
        }

        if (
            !Array.isArray(days) ||
            days.length === 0
        ) {
            return sendValidationError(
                res,
                "Days must be a non-empty array",
                {
                    field: "days"
                }
            );
        }

        const invalidDays = [];

        days.forEach(
            (dayItem, dayIndex) => {

                if (!dayItem.day) {
                    invalidDays.push({
                        index: dayIndex,
                        field: "day"
                    });
                }

                if (!dayItem.title) {
                    invalidDays.push({
                        index: dayIndex,
                        field: "title"
                    });
                }

                if (
                    !Array.isArray(dayItem.exercises) ||
                    dayItem.exercises.length === 0
                ) {
                    invalidDays.push({
                        index: dayIndex,
                        field: "exercises"
                    });
                }
            }
        );

        if (invalidDays.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout days structure",
                {
                    invalidDays:
                    invalidDays
                }
            );
        }

        const invalidExercises = [];

        days.forEach(
            (dayItem, dayIndex) => {

                if (
                    Array.isArray(
                        dayItem.exercises
                    )
                ) {

                    dayItem.exercises.forEach(
                        (
                            exercise,
                            exerciseIndex
                        ) => {

                            if (
                                typeof exercise.exerciseId !== "number" ||
                                exercise.exerciseId <= 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "exerciseId",
                                    value:
                                    exercise.exerciseId
                                });
                            }

                            if (
                                !exercise.exerciseName
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "exerciseName"
                                });
                            }

                            if (
                                typeof exercise.targetSets !== "number" ||
                                exercise.targetSets <= 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "targetSets",
                                    value:
                                    exercise.targetSets
                                });
                            }

                            if (
                                typeof exercise.targetReps !== "number" ||
                                exercise.targetReps <= 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "targetReps",
                                    value:
                                    exercise.targetReps
                                });
                            }

                            if (
                                typeof exercise.targetWeight !== "number" ||
                                exercise.targetWeight < 0
                            ) {
                                invalidExercises.push({
                                    dayIndex:
                                    dayIndex,
                                    exerciseIndex:
                                    exerciseIndex,
                                    field:
                                        "targetWeight",
                                    value:
                                    exercise.targetWeight
                                });
                            }
                        }
                    );
                }
            }
        );

        if (invalidExercises.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout plan exercises",
                {
                    invalidExercises:
                    invalidExercises
                }
            );
        }

        workoutPlans[
            workoutPlanIndex
            ] = {
            workoutPlanId: id,
            userId,
            name,
            goal,
            isActive,
            days,
            createdAt:
            workoutPlans[
                workoutPlanIndex
                ].createdAt
        };

        return sendSuccess(
            res,
            200,
            workoutPlans[
                workoutPlanIndex
                ]
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/workout-plans/:id
const deleteWorkoutPlan = (req, res) => {
    try {

        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid workout plan id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const workoutPlanIndex =
            workoutPlans.findIndex(
                plan =>
                    plan.workoutPlanId === id
            );

        if (workoutPlanIndex === -1) {
            return sendNotFound(
                res,
                "Workout plan not found",
                {
                    workoutPlanId: id
                }
            );
        }

        const deletedWorkoutPlan =
            workoutPlans.splice(
                workoutPlanIndex,
                1
            )[0];

        return sendSuccess(
            res,
            200,
            {
                workoutPlanId:
                deletedWorkoutPlan.workoutPlanId
            }
        );

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = {
    getAllWorkoutPlans,
    getWorkoutPlanById,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
};
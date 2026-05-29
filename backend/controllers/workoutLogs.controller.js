const workoutLogs = require("../models/workoutLogs.model");

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require("../middleware/errorHandlers");

const {
    validateId,
    getMissingFields
} = require("../middleware/validation");

// GET /api/workout-logs
const getAllWorkoutLogs = (req, res) => {
    try {
        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole === "admin") {
            return sendSuccess(res, 200, workoutLogs);
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

        const userWorkoutLogs = workoutLogs.filter(
            log => log.userId === requestUserId
        );

        return sendSuccess(
            res,
            200,
            userWorkoutLogs
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/workout-logs/:id
const getWorkoutLogById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid workout log id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const workoutLog = workoutLogs.find(
            log => log.workoutLogId === id
        );

        if (!workoutLog) {
            return sendNotFound(
                res,
                "Workout log not found",
                {
                    workoutLogId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (
            userRole !== "admin" &&
            workoutLog.userId !== requestUserId
        ) {
            return sendNotFound(
                res,
                "Workout log not found",
                { workoutLogId: id }
            );
        }

        return sendSuccess(
            res,
            200,
            workoutLog
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/workout-logs
const createWorkoutLog = (req, res) => {
    try {

        const userId = parseInt(req.headers["userid"]);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, "Missing user id", { field: "userid header" });
        }

        const {
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes
        } = req.body;

        const requiredFields = [
            "workoutPlanId",
            "date",
            "workoutTitle",
            "exercises",
            "durationMinutes",
            "difficultyRating"
        ];

        const missingFields = getMissingFields(
            req.body,
            requiredFields
        );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required workout log fields",
                {
                    missingFields: missingFields
                }
            );
        }

        if (
            typeof workoutPlanId !== "number" ||
            workoutPlanId <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid workout plan id",
                {
                    field: "workoutPlanId",
                    value: workoutPlanId
                }
            );
        }

        if (
            !Array.isArray(exercises) ||
            exercises.length === 0
        ) {
            return sendValidationError(
                res,
                "Exercises must be a non-empty array",
                {
                    field: "exercises"
                }
            );
        }

        if (
            typeof durationMinutes !== "number" ||
            durationMinutes <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid workout duration",
                {
                    field: "durationMinutes",
                    value: durationMinutes
                }
            );
        }

        if (
            typeof difficultyRating !== "number" ||
            difficultyRating < 1 ||
            difficultyRating > 10
        ) {
            return sendValidationError(
                res,
                "Difficulty rating must be a number between 1 and 10",
                {
                    field: "difficultyRating",
                    value: difficultyRating
                }
            );
        }

        const invalidExercises = [];

        exercises.forEach(
            (exercise, exerciseIndex) => {

                if (
                    typeof exercise.exerciseId !== "number" ||
                    exercise.exerciseId <= 0
                ) {
                    invalidExercises.push({
                        exerciseIndex: exerciseIndex,
                        field: "exerciseId",
                        value: exercise.exerciseId
                    });
                }

                if (!exercise.exerciseName) {
                    invalidExercises.push({
                        exerciseIndex: exerciseIndex,
                        field: "exerciseName"
                    });
                }

                if (
                    !Array.isArray(exercise.sets) ||
                    exercise.sets.length === 0
                ) {
                    invalidExercises.push({
                        exerciseIndex: exerciseIndex,
                        field: "sets"
                    });
                }
            }
        );

        if (invalidExercises.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout log exercises",
                {
                    invalidExercises:
                    invalidExercises
                }
            );
        }

        const invalidSets = [];

        exercises.forEach(
            (exercise, exerciseIndex) => {

                if (Array.isArray(exercise.sets)) {

                    exercise.sets.forEach(
                        (set, setIndex) => {

                            if (
                                typeof set.setNumber !== "number" ||
                                set.setNumber <= 0
                            ) {
                                invalidSets.push({
                                    exerciseIndex:
                                    exerciseIndex,
                                    setIndex: setIndex,
                                    field: "setNumber",
                                    value: set.setNumber
                                });
                            }

                            if (
                                typeof set.reps !== "number" ||
                                set.reps < 0
                            ) {
                                invalidSets.push({
                                    exerciseIndex:
                                    exerciseIndex,
                                    setIndex: setIndex,
                                    field: "reps",
                                    value: set.reps
                                });
                            }

                            if (
                                typeof set.weight !== "number" ||
                                set.weight < 0
                            ) {
                                invalidSets.push({
                                    exerciseIndex:
                                    exerciseIndex,
                                    setIndex: setIndex,
                                    field: "weight",
                                    value: set.weight
                                });
                            }
                        }
                    );
                }
            }
        );

        if (invalidSets.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout log sets",
                {
                    invalidSets: invalidSets
                }
            );
        }

        const newWorkoutLog = {
            workoutLogId:
                workoutLogs.length > 0
                    ? workoutLogs[
                workoutLogs.length - 1
                    ].workoutLogId + 1
                    : 1,
            userId,
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes: notes || ""
        };

        workoutLogs.push(newWorkoutLog);

        return sendSuccess(
            res,
            201,
            newWorkoutLog
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/workout-logs/:id
const updateWorkoutLog = (req, res) => {
    try {

        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid workout log id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const workoutLogIndex =
            workoutLogs.findIndex(
                log => log.workoutLogId === id
            );

        if (workoutLogIndex === -1) {
            return sendNotFound(
                res,
                "Workout log not found",
                {
                    workoutLogId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = parseInt(req.headers["userid"]);

        if (userRole !== "admin" && workoutLogs[workoutLogIndex].userId !== requestUserId) {
            return sendNotFound(res, "Workout log not found", { workoutLogId: id });
        }

        const {
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes
        } = req.body;

        const requiredFields = [
            "workoutPlanId",
            "date",
            "workoutTitle",
            "exercises",
            "durationMinutes",
            "difficultyRating"
        ];

        const missingFields = getMissingFields(
            req.body,
            requiredFields
        );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required workout log fields",
                {
                    missingFields: missingFields
                }
            );
        }

        if (
            typeof workoutPlanId !== "number" ||
            workoutPlanId <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid workout plan id",
                {
                    field: "workoutPlanId",
                    value: workoutPlanId
                }
            );
        }

        if (
            !Array.isArray(exercises) ||
            exercises.length === 0
        ) {
            return sendValidationError(
                res,
                "Exercises must be a non-empty array",
                {
                    field: "exercises"
                }
            );
        }

        if (
            typeof durationMinutes !== "number" ||
            durationMinutes <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid workout duration",
                {
                    field: "durationMinutes",
                    value: durationMinutes
                }
            );
        }

        if (
            typeof difficultyRating !== "number" ||
            difficultyRating < 1 ||
            difficultyRating > 10
        ) {
            return sendValidationError(
                res,
                "Difficulty rating must be a number between 1 and 10",
                {
                    field: "difficultyRating",
                    value: difficultyRating
                }
            );
        }

        const invalidExercises = [];

        exercises.forEach(
            (exercise, exerciseIndex) => {

                if (
                    typeof exercise.exerciseId !== "number" ||
                    exercise.exerciseId <= 0
                ) {
                    invalidExercises.push({
                        exerciseIndex: exerciseIndex,
                        field: "exerciseId",
                        value: exercise.exerciseId
                    });
                }

                if (!exercise.exerciseName) {
                    invalidExercises.push({
                        exerciseIndex: exerciseIndex,
                        field: "exerciseName"
                    });
                }

                if (
                    !Array.isArray(exercise.sets) ||
                    exercise.sets.length === 0
                ) {
                    invalidExercises.push({
                        exerciseIndex: exerciseIndex,
                        field: "sets"
                    });
                }
            }
        );

        if (invalidExercises.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout log exercises",
                {
                    invalidExercises:
                    invalidExercises
                }
            );
        }

        const invalidSets = [];

        exercises.forEach(
            (exercise, exerciseIndex) => {

                if (Array.isArray(exercise.sets)) {

                    exercise.sets.forEach(
                        (set, setIndex) => {

                            if (
                                typeof set.setNumber !== "number" ||
                                set.setNumber <= 0
                            ) {
                                invalidSets.push({
                                    exerciseIndex:
                                    exerciseIndex,
                                    setIndex: setIndex,
                                    field: "setNumber",
                                    value: set.setNumber
                                });
                            }

                            if (
                                typeof set.reps !== "number" ||
                                set.reps < 0
                            ) {
                                invalidSets.push({
                                    exerciseIndex:
                                    exerciseIndex,
                                    setIndex: setIndex,
                                    field: "reps",
                                    value: set.reps
                                });
                            }

                            if (
                                typeof set.weight !== "number" ||
                                set.weight < 0
                            ) {
                                invalidSets.push({
                                    exerciseIndex:
                                    exerciseIndex,
                                    setIndex: setIndex,
                                    field: "weight",
                                    value: set.weight
                                });
                            }
                        }
                    );
                }
            }
        );

        if (invalidSets.length > 0) {
            return sendValidationError(
                res,
                "Invalid workout log sets",
                {
                    invalidSets: invalidSets
                }
            );
        }

        workoutLogs[workoutLogIndex] = {
            workoutLogId: id,
            userId: workoutLogs[workoutLogIndex].userId,
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes: notes || ""
        };

        return sendSuccess(
            res,
            200,
            workoutLogs[workoutLogIndex]
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/workout-logs/:id
const deleteWorkoutLog = (req, res) => {
    try {

        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid workout log id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const workoutLogIndex =
            workoutLogs.findIndex(
                log => log.workoutLogId === id
            );

        if (workoutLogIndex === -1) {
            return sendNotFound(
                res,
                "Workout log not found",
                {
                    workoutLogId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = parseInt(req.headers["userid"]);

        if (userRole !== "admin" && workoutLogs[workoutLogIndex].userId !== requestUserId) {
            return sendNotFound(res, "Workout log not found", { workoutLogId: id });
        }

        const deletedWorkoutLog =
            workoutLogs.splice(
                workoutLogIndex,
                1
            )[0];

        return sendSuccess(
            res,
            200,
            {
                workoutLogId:
                deletedWorkoutLog.workoutLogId
            }
        );

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = {
    getAllWorkoutLogs,
    getWorkoutLogById,
    createWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog
};
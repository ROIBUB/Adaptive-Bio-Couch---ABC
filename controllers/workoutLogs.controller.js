const workoutLogs = require("../models/workoutLogs.model");

// GET /api/workout-logs
const getAllWorkoutLogs = (req, res) => {
    try {
        const userRole = req.headers.role;
        const requestUserId = Number(req.headers.userid);

        if (userRole === "admin") {
            return res.status(200).json({
                success: true,
                data: workoutLogs,
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

        const userWorkoutLogs = workoutLogs.filter(log => log.userId === requestUserId);

        res.status(200).json({
            success: true,
            data: userWorkoutLogs,
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

// GET /api/workout-logs/:id
const getWorkoutLogById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const workoutLog = workoutLogs.find(log => log.workoutLogId === id);

        if (!workoutLog) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Workout log not found",
                    details: {
                        workoutLogId: id
                    }
                }
            });
        }

        const userRole = req.headers.role;
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && workoutLog.userId !== requestUserId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You are not allowed to access this workout log",
                    details: {
                        requiredOwnerUserId: workoutLog.userId,
                        requestUserId: isNaN(requestUserId) ? null : requestUserId,
                        role: userRole || null
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: workoutLog,
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

// POST /api/workout-logs
const createWorkoutLog = (req, res) => {
    try {
        const {
            userId,
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes
        } = req.body;

        const requiredFields = [
            "userId",
            "workoutPlanId",
            "date",
            "workoutTitle",
            "exercises",
            "durationMinutes",
            "difficultyRating"
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
                    message: "Missing required workout log fields",
                    details: {
                        missingFields: missingFields
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

        if (typeof workoutPlanId !== "number" || workoutPlanId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan id",
                    details: {
                        field: "workoutPlanId",
                        value: workoutPlanId
                    }
                }
            });
        }

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Exercises must be a non-empty array",
                    details: {
                        field: "exercises"
                    }
                }
            });
        }

        if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout duration",
                    details: {
                        field: "durationMinutes",
                        value: durationMinutes
                    }
                }
            });
        }

        if (
            typeof difficultyRating !== "number" ||
            difficultyRating < 1 ||
            difficultyRating > 10
        ) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Difficulty rating must be a number between 1 and 10",
                    details: {
                        field: "difficultyRating",
                        value: difficultyRating
                    }
                }
            });
        }

        const invalidExercises = [];

        exercises.forEach((exercise, exerciseIndex) => {
            if (typeof exercise.exerciseId !== "number" || exercise.exerciseId <= 0) {
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

            if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
                invalidExercises.push({
                    exerciseIndex: exerciseIndex,
                    field: "sets"
                });
            }
        });

        if (invalidExercises.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log exercises",
                    details: {
                        invalidExercises: invalidExercises
                    }
                }
            });
        }

        const invalidSets = [];

        exercises.forEach((exercise, exerciseIndex) => {
            if (Array.isArray(exercise.sets)) {
                exercise.sets.forEach((set, setIndex) => {
                    if (typeof set.setNumber !== "number" || set.setNumber <= 0) {
                        invalidSets.push({
                            exerciseIndex: exerciseIndex,
                            setIndex: setIndex,
                            field: "setNumber",
                            value: set.setNumber
                        });
                    }

                    if (typeof set.reps !== "number" || set.reps < 0) {
                        invalidSets.push({
                            exerciseIndex: exerciseIndex,
                            setIndex: setIndex,
                            field: "reps",
                            value: set.reps
                        });
                    }

                    if (typeof set.weight !== "number" || set.weight < 0) {
                        invalidSets.push({
                            exerciseIndex: exerciseIndex,
                            setIndex: setIndex,
                            field: "weight",
                            value: set.weight
                        });
                    }
                });
            }
        });

        if (invalidSets.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log sets",
                    details: {
                        invalidSets: invalidSets
                    }
                }
            });
        }

        const newWorkoutLog = {
            workoutLogId: workoutLogs.length > 0
                ? workoutLogs[workoutLogs.length - 1].workoutLogId + 1
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

        res.status(201).json({
            success: true,
            data: newWorkoutLog,
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

// PUT /api/workout-logs/:id
const updateWorkoutLog = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const workoutLogIndex = workoutLogs.findIndex(log => log.workoutLogId === id);

        if (workoutLogIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Workout log not found",
                    details: {
                        workoutLogId: id
                    }
                }
            });
        }

        const {
            userId,
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes
        } = req.body;

        const requiredFields = [
            "userId",
            "workoutPlanId",
            "date",
            "workoutTitle",
            "exercises",
            "durationMinutes",
            "difficultyRating"
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
                    message: "Missing required workout log fields",
                    details: {
                        missingFields: missingFields
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

        if (typeof workoutPlanId !== "number" || workoutPlanId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan id",
                    details: {
                        field: "workoutPlanId",
                        value: workoutPlanId
                    }
                }
            });
        }

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Exercises must be a non-empty array",
                    details: {
                        field: "exercises"
                    }
                }
            });
        }

        if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout duration",
                    details: {
                        field: "durationMinutes",
                        value: durationMinutes
                    }
                }
            });
        }

        if (
            typeof difficultyRating !== "number" ||
            difficultyRating < 1 ||
            difficultyRating > 10
        ) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Difficulty rating must be a number between 1 and 10",
                    details: {
                        field: "difficultyRating",
                        value: difficultyRating
                    }
                }
            });
        }

        const invalidExercises = [];

        exercises.forEach((exercise, exerciseIndex) => {
            if (typeof exercise.exerciseId !== "number" || exercise.exerciseId <= 0) {
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

            if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
                invalidExercises.push({
                    exerciseIndex: exerciseIndex,
                    field: "sets"
                });
            }
        });

        if (invalidExercises.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log exercises",
                    details: {
                        invalidExercises: invalidExercises
                    }
                }
            });
        }

        const invalidSets = [];

        exercises.forEach((exercise, exerciseIndex) => {
            if (Array.isArray(exercise.sets)) {
                exercise.sets.forEach((set, setIndex) => {
                    if (typeof set.setNumber !== "number" || set.setNumber <= 0) {
                        invalidSets.push({
                            exerciseIndex: exerciseIndex,
                            setIndex: setIndex,
                            field: "setNumber",
                            value: set.setNumber
                        });
                    }

                    if (typeof set.reps !== "number" || set.reps < 0) {
                        invalidSets.push({
                            exerciseIndex: exerciseIndex,
                            setIndex: setIndex,
                            field: "reps",
                            value: set.reps
                        });
                    }

                    if (typeof set.weight !== "number" || set.weight < 0) {
                        invalidSets.push({
                            exerciseIndex: exerciseIndex,
                            setIndex: setIndex,
                            field: "weight",
                            value: set.weight
                        });
                    }
                });
            }
        });

        if (invalidSets.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log sets",
                    details: {
                        invalidSets: invalidSets
                    }
                }
            });
        }

        workoutLogs[workoutLogIndex] = {
            workoutLogId: id,
            userId,
            workoutPlanId,
            date,
            workoutTitle,
            exercises,
            durationMinutes,
            difficultyRating,
            notes: notes || ""
        };

        res.status(200).json({
            success: true,
            data: workoutLogs[workoutLogIndex],
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

// DELETE /api/workout-logs/:id
const deleteWorkoutLog = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout log id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const workoutLogIndex = workoutLogs.findIndex(log => log.workoutLogId === id);

        if (workoutLogIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Workout log not found",
                    details: {
                        workoutLogId: id
                    }
                }
            });
        }

        const deletedWorkoutLog = workoutLogs.splice(workoutLogIndex, 1)[0];

        res.status(200).json({
            success: true,
            data: {
                workoutLogId: deletedWorkoutLog.workoutLogId
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
    getAllWorkoutLogs,
    getWorkoutLogById,
    createWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog
};
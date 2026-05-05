const workoutPlans = require("../models/workoutPlans.model");

// GET /api/workout-plans
const getAllWorkoutPlans = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: workoutPlans,
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

// GET /api/workout-plans/:id
const getWorkoutPlanById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const workoutPlan = workoutPlans.find(plan => plan.workoutPlanId === id);

        if (!workoutPlan) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Workout plan not found",
                    details: {
                        workoutPlanId: id
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: workoutPlan,
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

        const missingFields = requiredFields.filter(field =>
            req.body[field] === undefined || req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required workout plan fields",
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

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid isActive value",
                    details: {
                        field: "isActive",
                        value: isActive
                    }
                }
            });
        }

        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Days must be a non-empty array",
                    details: {
                        field: "days"
                    }
                }
            });
        }

        const invalidDays = [];

        days.forEach((dayItem, dayIndex) => {
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

            if (!Array.isArray(dayItem.exercises) || dayItem.exercises.length === 0) {
                invalidDays.push({
                    index: dayIndex,
                    field: "exercises"
                });
            }
        });

        if (invalidDays.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout days structure",
                    details: {
                        invalidDays: invalidDays
                    }
                }
            });
        }

        const invalidExercises = [];

        days.forEach((dayItem, dayIndex) => {
            if (Array.isArray(dayItem.exercises)) {
                dayItem.exercises.forEach((exercise, exerciseIndex) => {
                    if (typeof exercise.exerciseId !== "number" || exercise.exerciseId <= 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "exerciseId",
                            value: exercise.exerciseId
                        });
                    }

                    if (!exercise.exerciseName) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "exerciseName"
                        });
                    }

                    if (typeof exercise.targetSets !== "number" || exercise.targetSets <= 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "targetSets",
                            value: exercise.targetSets
                        });
                    }

                    if (typeof exercise.targetReps !== "number" || exercise.targetReps <= 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "targetReps",
                            value: exercise.targetReps
                        });
                    }

                    if (typeof exercise.targetWeight !== "number" || exercise.targetWeight < 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "targetWeight",
                            value: exercise.targetWeight
                        });
                    }
                });
            }
        });

        if (invalidExercises.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan exercises",
                    details: {
                        invalidExercises: invalidExercises
                    }
                }
            });
        }

        const newWorkoutPlan = {
            workoutPlanId: workoutPlans.length > 0
                ? workoutPlans[workoutPlans.length - 1].workoutPlanId + 1
                : 1,
            userId,
            name,
            goal,
            isActive,
            days,
            createdAt: new Date().toISOString().split("T")[0]
        };

        workoutPlans.push(newWorkoutPlan);

        res.status(201).json({
            success: true,
            data: newWorkoutPlan,
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

// PUT /api/workout-plans/:id
const updateWorkoutPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const workoutPlanIndex = workoutPlans.findIndex(plan => plan.workoutPlanId === id);

        if (workoutPlanIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Workout plan not found",
                    details: {
                        workoutPlanId: id
                    }
                }
            });
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

        const missingFields = requiredFields.filter(field =>
            req.body[field] === undefined || req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required workout plan fields",
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

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid isActive value",
                    details: {
                        field: "isActive",
                        value: isActive
                    }
                }
            });
        }

        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Days must be a non-empty array",
                    details: {
                        field: "days"
                    }
                }
            });
        }

        const invalidDays = [];

        days.forEach((dayItem, dayIndex) => {
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

            if (!Array.isArray(dayItem.exercises) || dayItem.exercises.length === 0) {
                invalidDays.push({
                    index: dayIndex,
                    field: "exercises"
                });
            }
        });

        if (invalidDays.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout days structure",
                    details: {
                        invalidDays: invalidDays
                    }
                }
            });
        }

        const invalidExercises = [];

        days.forEach((dayItem, dayIndex) => {
            if (Array.isArray(dayItem.exercises)) {
                dayItem.exercises.forEach((exercise, exerciseIndex) => {
                    if (typeof exercise.exerciseId !== "number" || exercise.exerciseId <= 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "exerciseId",
                            value: exercise.exerciseId
                        });
                    }

                    if (!exercise.exerciseName) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "exerciseName"
                        });
                    }

                    if (typeof exercise.targetSets !== "number" || exercise.targetSets <= 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "targetSets",
                            value: exercise.targetSets
                        });
                    }

                    if (typeof exercise.targetReps !== "number" || exercise.targetReps <= 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "targetReps",
                            value: exercise.targetReps
                        });
                    }

                    if (typeof exercise.targetWeight !== "number" || exercise.targetWeight < 0) {
                        invalidExercises.push({
                            dayIndex: dayIndex,
                            exerciseIndex: exerciseIndex,
                            field: "targetWeight",
                            value: exercise.targetWeight
                        });
                    }
                });
            }
        });

        if (invalidExercises.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan exercises",
                    details: {
                        invalidExercises: invalidExercises
                    }
                }
            });
        }

        workoutPlans[workoutPlanIndex] = {
            workoutPlanId: id,
            userId,
            name,
            goal,
            isActive,
            days,
            createdAt: workoutPlans[workoutPlanIndex].createdAt
        };

        res.status(200).json({
            success: true,
            data: workoutPlans[workoutPlanIndex],
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

// DELETE /api/workout-plans/:id
const deleteWorkoutPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid workout plan id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const workoutPlanIndex = workoutPlans.findIndex(plan => plan.workoutPlanId === id);

        if (workoutPlanIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Workout plan not found",
                    details: {
                        workoutPlanId: id
                    }
                }
            });
        }

        const deletedWorkoutPlan = workoutPlans.splice(workoutPlanIndex, 1)[0];

        res.status(200).json({
            success: true,
            data: {
                workoutPlanId: deletedWorkoutPlan.workoutPlanId
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
    getAllWorkoutPlans,
    getWorkoutPlanById,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
};
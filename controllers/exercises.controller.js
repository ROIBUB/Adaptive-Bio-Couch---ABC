const exercises = require('../models/exercises.model');

// GET /api/exercises
const getAllExercises = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: exercises,
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

// GET /api/exercises/:id
const getExerciseById = (req, res) => {
    try {
        const id = Number(req.params.id);

        // validation for id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid exercise id",
                    details: { field: "id" }
                }
            });
        }

        const exercise = exercises.find(ex => ex.exerciseId === id);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Exercise not found",
                    details: { exerciseId: id }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: exercise,
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

// POST /api/exercises
const createExercise = (req, res) => {
    try {
        const { name, muscleGroup, difficultyLevel, equipment, description } = req.body;

        const requiredFields = ["name", "muscleGroup", "difficultyLevel"];

        for (let field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Missing required field: ${field}`,
                        details: {
                            field: field
                        }
                    }
                });
            }
        }

        const newExercise = {
            exerciseId: exercises.length > 0
                ? exercises[exercises.length - 1].exerciseId + 1
                : 1,
            name,
            muscleGroup,
            difficultyLevel,
            equipment: equipment || "",
            description: description || ""
        };

        exercises.push(newExercise);

        res.status(201).json({
            success: true,
            data: newExercise,
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

// PUT /api/exercises/:id
const updateExercise = (req, res) => {
    try {
        const id = Number(req.params.id);

        // validation for id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid exercise id",
                    details: { field: "id" }
                }
            });
        }

        const { name, muscleGroup, difficultyLevel, equipment, description } = req.body;

        const requiredFields = ["name", "muscleGroup", "difficultyLevel"];

        for (let field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Missing required field: ${field}`,
                        details: {
                            field: field
                        }
                    }
                });
            }
        }

        const exerciseIndex = exercises.findIndex(ex => ex.exerciseId === id);

        if (exerciseIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Exercise not found",
                    details: { exerciseId: id }
                }
            });
        }

        exercises[exerciseIndex] = {
            exerciseId: id,
            name,
            muscleGroup,
            difficultyLevel,
            equipment: equipment || "",
            description: description || ""
        };

        res.status(200).json({
            success: true,
            data: exercises[exerciseIndex],
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

// DELETE /api/exercises/:id
const deleteExercise = (req, res) => {
    try {
        const id = Number(req.params.id);

        // validation for id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid exercise id",
                    details: {
                        field: "id"
                    }
                }
            });
        }

        const exerciseIndex = exercises.findIndex(ex => ex.exerciseId === id);

        if (exerciseIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Exercise not found",
                    details: { exerciseId: id }
                }
            });
        }

        const deletedExercise = exercises.splice(exerciseIndex, 1)[0];

        res.status(200).json({
            success: true,
            data: {
                exerciseId: deletedExercise.exerciseId
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
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};
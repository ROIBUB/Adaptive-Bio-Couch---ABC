const exercises = require('../models/exercises.model');

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

// GET /api/exercises
const getAllExercises = (req, res) => {
    try {
        return sendSuccess(res, 200, exercises);

    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/exercises/:id
const getExerciseById = (req, res) => {
    try {
        const id = Number(req.params.id);

        // validation for id
        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid exercise id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const exercise = exercises.find(ex => ex.exerciseId === id);

        if (!exercise) {
            return sendNotFound(
                res,
                "Exercise not found",
                {
                    exerciseId: id
                }
            );
        }

        return sendSuccess(res, 200, exercise);

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/exercises
const createExercise = (req, res) => {
    try {
        const {
            name,
            muscleGroup,
            difficultyLevel,
            equipment,
            description
        } = req.body;

        const requiredFields = [
            "name",
            "muscleGroup",
            "difficultyLevel"
        ];

        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required exercise fields",
                {
                    missingFields: missingFields
                }
            );
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

        return sendSuccess(res, 201, newExercise);

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/exercises/:id
const updateExercise = (req, res) => {
    try {
        const id = Number(req.params.id);

        // validation for id
        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid exercise id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const {
            name,
            muscleGroup,
            difficultyLevel,
            equipment,
            description
        } = req.body;

        const requiredFields = [
            "name",
            "muscleGroup",
            "difficultyLevel"
        ];

        const missingFields = getMissingFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required exercise fields",
                {
                    missingFields: missingFields
                }
            );
        }

        const exerciseIndex = exercises.findIndex(
            ex => ex.exerciseId === id
        );

        if (exerciseIndex === -1) {
            return sendNotFound(
                res,
                "Exercise not found",
                {
                    exerciseId: id
                }
            );
        }

        exercises[exerciseIndex] = {
            exerciseId: id,
            name,
            muscleGroup,
            difficultyLevel,
            equipment: equipment || "",
            description: description || ""
        };

        return sendSuccess(
            res,
            200,
            exercises[exerciseIndex]
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/exercises/:id
const deleteExercise = (req, res) => {
    try {
        const id = Number(req.params.id);

        // validation for id
        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid exercise id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const exerciseIndex = exercises.findIndex(
            ex => ex.exerciseId === id
        );

        if (exerciseIndex === -1) {
            return sendNotFound(
                res,
                "Exercise not found",
                {
                    exerciseId: id
                }
            );
        }

        const deletedExercise = exercises.splice(
            exerciseIndex,
            1
        )[0];

        return sendSuccess(
            res,
            200,
            {
                exerciseId: deletedExercise.exerciseId
            }
        );

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = {
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};
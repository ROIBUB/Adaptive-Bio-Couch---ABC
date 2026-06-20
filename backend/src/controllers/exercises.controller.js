const ExercisesModel = require('../../models/exercises.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

// GET /api/exercises
const getAllExercises = async (req, res) => {
    try {
        return sendSuccess(res, 200, await ExercisesModel.getAll());
    } catch (err) {
        console.error('[Exercises]', err);
        return sendServerError(res);
    }
};

// GET /api/exercises/:id
const getExerciseById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid exercise id', { field: 'id', value: req.params.id });
        }

        const exercise = await ExercisesModel.getById(id);

        if (!exercise) {
            return sendNotFound(res, 'Exercise not found', { exerciseId: id });
        }

        return sendSuccess(res, 200, exercise);
    } catch (err) {
        console.error('[Exercises]', err);
        return sendServerError(res);
    }
};

// POST /api/exercises
const createExercise = async (req, res) => {
    try {
        const { name, muscleGroup, difficultyLevel, equipment, description } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'muscleGroup', 'difficultyLevel']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required exercise fields', { missingFields });
        }

        const newExercise = await ExercisesModel.create({ name, muscleGroup, difficultyLevel, equipment, description });
        return sendSuccess(res, 201, newExercise);
    } catch (err) {
        console.error('[Exercises]', err);
        return sendServerError(res);
    }
};

// PUT /api/exercises/:id
const updateExercise = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid exercise id', { field: 'id', value: req.params.id });
        }

        const { name, muscleGroup, difficultyLevel, equipment, description } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'muscleGroup', 'difficultyLevel']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required exercise fields', { missingFields });
        }

        const updated = await ExercisesModel.update(id, { name, muscleGroup, difficultyLevel, equipment, description });

        if (!updated) {
            return sendNotFound(res, 'Exercise not found', { exerciseId: id });
        }

        return sendSuccess(res, 200, updated);
    } catch (err) {
        console.error('[Exercises]', err);
        return sendServerError(res);
    }
};

// DELETE /api/exercises/:id
const deleteExercise = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid exercise id', { field: 'id', value: req.params.id });
        }

        const deleted = await ExercisesModel.remove(id);

        if (!deleted) {
            return sendNotFound(res, 'Exercise not found', { exerciseId: id });
        }

        return sendSuccess(res, 200, { exerciseId: deleted.exerciseId });
    } catch (err) {
        console.error('[Exercises]', err);
        return sendServerError(res);
    }
};

module.exports = { getAllExercises, getExerciseById, createExercise, updateExercise, deleteExercise };

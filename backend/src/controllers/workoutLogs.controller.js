const WorkoutLogsModel = require('../../models/workoutLogs.model');

const { sendSuccess, sendValidationError, sendNotFound, sendServerError } = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/workout-logs
const getAllWorkoutLogs = async (req, res) => {
    try {
        const requestUserId = Number(req.headers.userid);
        const filterPlanId = req.query.workoutPlanId ? Number(req.query.workoutPlanId) : null;
        const filterDayId  = req.query.workoutDayId  ? Number(req.query.workoutDayId)  : null;

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        let logs = await WorkoutLogsModel.getByUserId(requestUserId);

        if (filterPlanId) {
            logs = logs.filter(l => l.workoutPlanId === filterPlanId);
        }
        if (filterDayId) {
            logs = logs.filter(l => l.workoutDayId === filterDayId);
        }

        return sendSuccess(res, 200, logs);
    } catch (err) {
        console.error('[WorkoutLogs]', err);
        return sendServerError(res);
    }
};

// GET /api/workout-logs/:id
const getWorkoutLogById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout log id', { field: 'id', value: req.params.id });
        }

        const log = await WorkoutLogsModel.getById(id);

        if (!log) {
            return sendNotFound(res, 'Workout log not found', { workoutLogId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && log.userId !== requestUserId) {
            return sendNotFound(res, 'Workout log not found', { workoutLogId: id });
        }

        return sendSuccess(res, 200, log);
    } catch (err) {
        console.error('[WorkoutLogs]', err);
        return sendServerError(res);
    }
};

// POST /api/workout-logs
const createWorkoutLog = async (req, res) => {
    try {
        const userId = parseInt(req.headers['userid']);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'Missing user id', { field: 'userid header' });
        }

        const { workoutPlanId, workoutDayId, date, workoutTitle, exercises, durationMinutes, difficultyRating, notes } = req.body;

        const missingFields = getMissingFields(req.body, ['workoutPlanId', 'date', 'workoutTitle', 'exercises', 'durationMinutes', 'difficultyRating']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required workout log fields', { missingFields });
        }

        if (typeof workoutPlanId !== 'number' || workoutPlanId <= 0) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'workoutPlanId', value: workoutPlanId });
        }

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return sendValidationError(res, 'Exercises must be a non-empty array', { field: 'exercises' });
        }

        if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
            return sendValidationError(res, 'Invalid workout duration', { field: 'durationMinutes', value: durationMinutes });
        }

        if (typeof difficultyRating !== 'number' || difficultyRating < 1 || difficultyRating > 10) {
            return sendValidationError(res, 'Difficulty rating must be a number between 1 and 10', { field: 'difficultyRating', value: difficultyRating });
        }

        const invalidExercises = [];
        exercises.forEach((exercise, exerciseIndex) => {
            if (typeof exercise.exerciseId !== 'number' || exercise.exerciseId <= 0) {
                invalidExercises.push({ exerciseIndex, field: 'exerciseId', value: exercise.exerciseId });
            }
            if (!exercise.exerciseName) {
                invalidExercises.push({ exerciseIndex, field: 'exerciseName' });
            }
            if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
                invalidExercises.push({ exerciseIndex, field: 'sets' });
            }
        });

        if (invalidExercises.length > 0) {
            return sendValidationError(res, 'Invalid workout log exercises', { invalidExercises });
        }

        const invalidSets = [];
        exercises.forEach((exercise, exerciseIndex) => {
            if (Array.isArray(exercise.sets)) {
                exercise.sets.forEach((set, setIndex) => {
                    if (typeof set.setNumber !== 'number' || set.setNumber <= 0) {
                        invalidSets.push({ exerciseIndex, setIndex, field: 'setNumber', value: set.setNumber });
                    }
                    if (typeof set.reps !== 'number' || set.reps < 0) {
                        invalidSets.push({ exerciseIndex, setIndex, field: 'reps', value: set.reps });
                    }
                    if (typeof set.weight !== 'number' || set.weight < 0) {
                        invalidSets.push({ exerciseIndex, setIndex, field: 'weight', value: set.weight });
                    }
                });
            }
        });

        if (invalidSets.length > 0) {
            return sendValidationError(res, 'Invalid workout log sets', { invalidSets });
        }

        const newLog = await WorkoutLogsModel.create({ userId, workoutPlanId, workoutDayId: workoutDayId || null, date, workoutTitle, durationMinutes, difficultyRating, notes });
        if (newLog === 'INVALID_FK') {
            return sendValidationError(res, 'Referenced workout plan does not exist', { field: 'workoutPlanId', value: workoutPlanId });
        }

        for (const exercise of exercises) {
            const newExercise = await WorkoutLogsModel.createLogExercise({
                workoutLogId: newLog.workoutLogId,
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName
            });
            if (newExercise === 'INVALID_FK') {
                return sendValidationError(res, 'Referenced exercise does not exist', { field: 'exerciseId', value: exercise.exerciseId });
            }
            for (const set of exercise.sets) {
                await WorkoutLogsModel.createLogSet({
                    workoutLogExerciseId: newExercise.id,
                    setNumber: set.setNumber,
                    reps: set.reps,
                    weight: set.weight
                });
            }
        }

        return sendSuccess(res, 201, await WorkoutLogsModel.getById(newLog.workoutLogId));
    } catch (err) {
        console.error('[WorkoutLogs]', err);
        return sendServerError(res);
    }
};

// PUT /api/workout-logs/:id
const updateWorkoutLog = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout log id', { field: 'id', value: req.params.id });
        }

        const log = await WorkoutLogsModel.getById(id);

        if (!log) {
            return sendNotFound(res, 'Workout log not found', { workoutLogId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && log.userId !== requestUserId) {
            return sendNotFound(res, 'Workout log not found', { workoutLogId: id });
        }

        const { workoutPlanId, date, workoutTitle, exercises, durationMinutes, difficultyRating, notes } = req.body;

        const missingFields = getMissingFields(req.body, ['workoutPlanId', 'date', 'workoutTitle', 'exercises', 'durationMinutes', 'difficultyRating']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required workout log fields', { missingFields });
        }

        if (typeof workoutPlanId !== 'number' || workoutPlanId <= 0) {
            return sendValidationError(res, 'Invalid workout plan id', { field: 'workoutPlanId', value: workoutPlanId });
        }

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return sendValidationError(res, 'Exercises must be a non-empty array', { field: 'exercises' });
        }

        if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
            return sendValidationError(res, 'Invalid workout duration', { field: 'durationMinutes', value: durationMinutes });
        }

        if (typeof difficultyRating !== 'number' || difficultyRating < 1 || difficultyRating > 10) {
            return sendValidationError(res, 'Difficulty rating must be a number between 1 and 10', { field: 'difficultyRating', value: difficultyRating });
        }

        const invalidExercises = [];
        exercises.forEach((exercise, exerciseIndex) => {
            if (typeof exercise.exerciseId !== 'number' || exercise.exerciseId <= 0) {
                invalidExercises.push({ exerciseIndex, field: 'exerciseId', value: exercise.exerciseId });
            }
            if (!exercise.exerciseName) {
                invalidExercises.push({ exerciseIndex, field: 'exerciseName' });
            }
            if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
                invalidExercises.push({ exerciseIndex, field: 'sets' });
            }
        });

        if (invalidExercises.length > 0) {
            return sendValidationError(res, 'Invalid workout log exercises', { invalidExercises });
        }

        const invalidSets = [];
        exercises.forEach((exercise, exerciseIndex) => {
            if (Array.isArray(exercise.sets)) {
                exercise.sets.forEach((set, setIndex) => {
                    if (typeof set.setNumber !== 'number' || set.setNumber <= 0) {
                        invalidSets.push({ exerciseIndex, setIndex, field: 'setNumber', value: set.setNumber });
                    }
                    if (typeof set.reps !== 'number' || set.reps < 0) {
                        invalidSets.push({ exerciseIndex, setIndex, field: 'reps', value: set.reps });
                    }
                    if (typeof set.weight !== 'number' || set.weight < 0) {
                        invalidSets.push({ exerciseIndex, setIndex, field: 'weight', value: set.weight });
                    }
                });
            }
        });

        if (invalidSets.length > 0) {
            return sendValidationError(res, 'Invalid workout log sets', { invalidSets });
        }

        const existingExercises = await WorkoutLogsModel.getLogExercises(id);
        for (const e of existingExercises) {
            await WorkoutLogsModel.removeLogExercise(e.id);
        }

        const updateResult = await WorkoutLogsModel.update(id, { workoutPlanId, date, workoutTitle, durationMinutes, difficultyRating, notes });
        if (updateResult === 'INVALID_FK') {
            return sendValidationError(res, 'Referenced workout plan does not exist', { field: 'workoutPlanId', value: workoutPlanId });
        }

        for (const exercise of exercises) {
            const newExercise = await WorkoutLogsModel.createLogExercise({
                workoutLogId: id,
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName
            });
            if (newExercise === 'INVALID_FK') {
                return sendValidationError(res, 'Referenced exercise does not exist', { field: 'exerciseId', value: exercise.exerciseId });
            }
            for (const set of exercise.sets) {
                await WorkoutLogsModel.createLogSet({
                    workoutLogExerciseId: newExercise.id,
                    setNumber: set.setNumber,
                    reps: set.reps,
                    weight: set.weight
                });
            }
        }

        return sendSuccess(res, 200, await WorkoutLogsModel.getById(id));
    } catch (err) {
        console.error('[WorkoutLogs]', err);
        return sendServerError(res);
    }
};

// DELETE /api/workout-logs/:id
const deleteWorkoutLog = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid workout log id', { field: 'id', value: req.params.id });
        }

        const log = await WorkoutLogsModel.getById(id);

        if (!log) {
            return sendNotFound(res, 'Workout log not found', { workoutLogId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && log.userId !== requestUserId) {
            return sendNotFound(res, 'Workout log not found', { workoutLogId: id });
        }

        const deleted = await WorkoutLogsModel.remove(id);
        return sendSuccess(res, 200, { workoutLogId: deleted.workoutLogId });
    } catch (err) {
        console.error('[WorkoutLogs]', err);
        return sendServerError(res);
    }
};

module.exports = { getAllWorkoutLogs, getWorkoutLogById, createWorkoutLog, updateWorkoutLog, deleteWorkoutLog };

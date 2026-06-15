const prisma = require('../prisma/prismaClient');
const { toDateOnly } = require('./_dateUtils');

const mapLogSet = (s) => ({
    setId: s.id,
    workoutLogExerciseId: s.log_exercise_id,
    setNumber: s.set_number,
    reps: s.reps,
    weight: s.weight_kg
});

const mapLogExercise = (e) => ({
    id: e.id,
    workoutLogId: e.workout_log_id,
    exerciseId: e.exercise_id,
    exerciseName: e.exercise_name,
    sets: (e.logSets || []).map(mapLogSet)
});

const mapLogExerciseFlat = (e) => ({
    id: e.id,
    workoutLogId: e.workout_log_id,
    exerciseId: e.exercise_id,
    exerciseName: e.exercise_name
});

const mapLog = (l) => ({
    workoutLogId: l.id,
    userId: l.user_id,
    workoutPlanId: l.workout_plan_id,
    workoutDayId: l.workout_plan_day_id,
    date: toDateOnly(l.log_date),
    workoutTitle: l.workout_title,
    durationMinutes: l.duration_minutes,
    difficultyRating: l.difficulty_rating,
    notes: l.notes,
    exercises: (l.logExercises || []).map(mapLogExercise)
});

const logInclude = { logExercises: { include: { logSets: true } } };

// --- log-level functions ---
const getAll = async () => {
    const logs = await prisma.workoutLog.findMany({ include: logInclude });
    return logs.map(mapLog);
};

const getById = async (id) => {
    const log = await prisma.workoutLog.findUnique({ where: { id }, include: logInclude });
    return log ? mapLog(log) : null;
};

const getByUserId = async (userId) => {
    const logs = await prisma.workoutLog.findMany({ where: { user_id: userId }, include: logInclude });
    return logs.map(mapLog);
};

const create = async (data) => {
    const created = await prisma.workoutLog.create({
        data: {
            user_id: data.userId,
            workout_plan_id: data.workoutPlanId,
            workout_plan_day_id: data.workoutDayId || null,
            log_date: new Date(data.date),
            workout_title: data.workoutTitle,
            duration_minutes: data.durationMinutes,
            difficulty_rating: data.difficultyRating,
            notes: data.notes || ""
        },
        include: logInclude
    });
    return mapLog(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.workoutLog.update({
            where: { id },
            data: {
                workout_plan_id: data.workoutPlanId,
                log_date: new Date(data.date),
                workout_title: data.workoutTitle,
                duration_minutes: data.durationMinutes,
                difficulty_rating: data.difficultyRating,
                notes: data.notes || ""
            },
            include: logInclude
        });
        return mapLog(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const remove = async (id) => {
    try {
        const deleted = await prisma.workoutLog.delete({ where: { id } });
        return {
            workoutLogId: deleted.id,
            userId: deleted.user_id,
            workoutPlanId: deleted.workout_plan_id,
            workoutDayId: deleted.workout_plan_day_id,
            date: toDateOnly(deleted.log_date),
            workoutTitle: deleted.workout_title,
            durationMinutes: deleted.duration_minutes,
            difficultyRating: deleted.difficulty_rating,
            notes: deleted.notes
        };
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

// --- log-exercise-level functions ---
const getLogExercises = async (logId) => {
    const exercises = await prisma.logExercise.findMany({ where: { workout_log_id: logId } });
    return exercises.map(mapLogExerciseFlat);
};

const getLogExerciseById = async (id) => {
    const exercise = await prisma.logExercise.findUnique({ where: { id } });
    return exercise ? mapLogExerciseFlat(exercise) : null;
};

const createLogExercise = async (data) => {
    const created = await prisma.logExercise.create({
        data: {
            workout_log_id: data.workoutLogId,
            exercise_id: data.exerciseId,
            exercise_name: data.exerciseName
        }
    });
    return mapLogExerciseFlat(created);
};

const updateLogExercise = async (id, data) => {
    const updateData = {};
    if (data.workoutLogId !== undefined) updateData.workout_log_id = data.workoutLogId;
    if (data.exerciseId !== undefined) updateData.exercise_id = data.exerciseId;
    if (data.exerciseName !== undefined) updateData.exercise_name = data.exerciseName;

    try {
        const updated = await prisma.logExercise.update({ where: { id }, data: updateData });
        return mapLogExerciseFlat(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const removeLogExercise = async (id) => {
    try {
        const deleted = await prisma.logExercise.delete({ where: { id } });
        return mapLogExerciseFlat(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

// --- log-set-level functions ---
const getLogSets = async (logExerciseId) => {
    const sets = await prisma.logSet.findMany({ where: { log_exercise_id: logExerciseId } });
    return sets.map(mapLogSet);
};

const getLogSetById = async (setId) => {
    const set = await prisma.logSet.findUnique({ where: { id: setId } });
    return set ? mapLogSet(set) : null;
};

const createLogSet = async (data) => {
    const created = await prisma.logSet.create({
        data: {
            log_exercise_id: data.workoutLogExerciseId,
            set_number: data.setNumber,
            reps: data.reps,
            weight_kg: data.weight
        }
    });
    return mapLogSet(created);
};

const updateLogSet = async (setId, data) => {
    const updateData = {};
    if (data.workoutLogExerciseId !== undefined) updateData.log_exercise_id = data.workoutLogExerciseId;
    if (data.setNumber !== undefined) updateData.set_number = data.setNumber;
    if (data.reps !== undefined) updateData.reps = data.reps;
    if (data.weight !== undefined) updateData.weight_kg = data.weight;

    try {
        const updated = await prisma.logSet.update({ where: { id: setId }, data: updateData });
        return mapLogSet(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const removeLogSet = async (setId) => {
    try {
        const deleted = await prisma.logSet.delete({ where: { id: setId } });
        return mapLogSet(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = {
    getAll, getById, getByUserId, create, update, remove,
    getLogExercises, getLogExerciseById, createLogExercise, updateLogExercise, removeLogExercise,
    getLogSets, getLogSetById, createLogSet, updateLogSet, removeLogSet
};

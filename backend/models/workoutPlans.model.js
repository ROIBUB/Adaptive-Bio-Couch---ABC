const prisma = require('../prisma/prismaClient');
const { toDateOnly } = require('./_dateUtils');

const mapPlanExercise = (e) => ({
    id: e.id,
    workoutDayId: e.day_id,
    exerciseId: e.exercise_id,
    exerciseName: e.exercise_name,
    targetSets: e.target_sets,
    targetReps: e.target_reps,
    targetWeight: e.target_weight
});

const mapDay = (d) => ({
    workoutDayId: d.id,
    workoutPlanId: d.workout_plan_id,
    day: d.day,
    title: d.workout_title,
    exercises: (d.planExercises || []).map(mapPlanExercise)
});

const mapDayFlat = (d) => ({
    workoutDayId: d.id,
    workoutPlanId: d.workout_plan_id,
    day: d.day,
    title: d.workout_title
});

const mapPlan = (p) => ({
    workoutPlanId: p.id,
    userId: p.user_id,
    name: p.plan_name,
    goal: p.fitness_goal,
    isActive: p.is_active,
    createdAt: toDateOnly(p.created_at),
    days: (p.workoutPlanDays || []).map(mapDay)
});

const planInclude = { workoutPlanDays: { include: { planExercises: true } } };

// --- plan-level functions ---
const getAll = async () => {
    const plans = await prisma.workoutPlan.findMany({ include: planInclude });
    return plans.map(mapPlan);
};

const getById = async (id) => {
    const plan = await prisma.workoutPlan.findUnique({ where: { id }, include: planInclude });
    return plan ? mapPlan(plan) : null;
};

const getByUserId = async (userId) => {
    const plans = await prisma.workoutPlan.findMany({
        where: { user_id: userId, is_active: true },
        include: planInclude
    });
    return plans.map(mapPlan);
};

const deactivateByUserId = async (userId) => {
    await prisma.workoutPlan.updateMany({
        where: { user_id: userId },
        data: { is_active: false }
    });
};

const create = async (data) => {
    const created = await prisma.workoutPlan.create({
        data: {
            user_id: data.userId,
            plan_name: data.name,
            fitness_goal: data.goal,
            is_active: data.isActive,
            created_at: new Date()
        },
        include: planInclude
    });
    return mapPlan(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.workoutPlan.update({
            where: { id },
            data: {
                plan_name: data.name,
                fitness_goal: data.goal,
                is_active: data.isActive
            },
            include: planInclude
        });
        return mapPlan(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const remove = async (id) => {
    try {
        const deleted = await prisma.workoutPlan.delete({ where: { id } });
        return {
            workoutPlanId: deleted.id,
            userId: deleted.user_id,
            name: deleted.plan_name,
            goal: deleted.fitness_goal,
            isActive: deleted.is_active,
            createdAt: toDateOnly(deleted.created_at)
        };
    } catch (err) {
        if (err.code === 'P2025') return null;
        if (err.code === 'P2003') return 'FK_RESTRICT';
        throw err;
    }
};

// --- day-level functions ---
const getDays = async (planId) => {
    const days = await prisma.workoutPlanDay.findMany({ where: { workout_plan_id: planId } });
    return days.map(mapDayFlat);
};

const getDayById = async (dayId) => {
    const day = await prisma.workoutPlanDay.findUnique({ where: { id: dayId } });
    return day ? mapDayFlat(day) : null;
};

const createDay = async (data) => {
    const created = await prisma.workoutPlanDay.create({
        data: {
            workout_plan_id: data.workoutPlanId,
            day: data.day,
            workout_title: data.title
        }
    });
    return mapDayFlat(created);
};

const updateDay = async (dayId, data) => {
    try {
        const updated = await prisma.workoutPlanDay.update({
            where: { id: dayId },
            data: { day: data.day, workout_title: data.title }
        });
        return mapDayFlat(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const removeDay = async (dayId) => {
    try {
        const deleted = await prisma.workoutPlanDay.delete({ where: { id: dayId } });
        return mapDayFlat(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

// --- day-exercise-level functions ---
const getDayExercises = async (dayId) => {
    const exercises = await prisma.planExercise.findMany({ where: { day_id: dayId } });
    return exercises.map(mapPlanExercise);
};

const getDayExerciseById = async (id) => {
    const exercise = await prisma.planExercise.findUnique({ where: { id } });
    return exercise ? mapPlanExercise(exercise) : null;
};

const createDayExercise = async (data) => {
    const created = await prisma.planExercise.create({
        data: {
            day_id: data.workoutDayId,
            exercise_id: data.exerciseId,
            exercise_name: data.exerciseName,
            target_sets: data.targetSets,
            target_reps: data.targetReps,
            target_weight: data.targetWeight
        }
    });
    return mapPlanExercise(created);
};

const updateDayExercise = async (id, data) => {
    const updateData = {};
    if (data.workoutDayId !== undefined) updateData.day_id = data.workoutDayId;
    if (data.exerciseId !== undefined) updateData.exercise_id = data.exerciseId;
    if (data.exerciseName !== undefined) updateData.exercise_name = data.exerciseName;
    if (data.targetSets !== undefined) updateData.target_sets = data.targetSets;
    if (data.targetReps !== undefined) updateData.target_reps = data.targetReps;
    if (data.targetWeight !== undefined) updateData.target_weight = data.targetWeight;

    try {
        const updated = await prisma.planExercise.update({ where: { id }, data: updateData });
        return mapPlanExercise(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const removeDayExercise = async (id) => {
    try {
        const deleted = await prisma.planExercise.delete({ where: { id } });
        return mapPlanExercise(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = {
    getAll, getById, getByUserId, deactivateByUserId, create, update, remove,
    getDays, getDayById, createDay, updateDay, removeDay,
    getDayExercises, getDayExerciseById, createDayExercise, updateDayExercise, removeDayExercise
};

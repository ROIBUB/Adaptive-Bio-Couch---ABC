// --- workout_plans ---
let workoutPlans = [
    { workoutPlanId: 1, userId: 1, name: "John Doe - 3 Day Muscle Gain Plan",  goal: "muscle gain", isActive: true, createdAt: "2026-05-05" },
    { workoutPlanId: 2, userId: 3, name: "Dana Cohen - 3 Day Muscle Gain Plan", goal: "muscle gain", isActive: true, createdAt: "2026-05-05" }
];

// --- workout_days ---
let workoutDays = [
    { workoutDayId: 1, workoutPlanId: 1, day: "Sunday",    title: "Full Body A" },
    { workoutDayId: 2, workoutPlanId: 1, day: "Tuesday",   title: "Upper Body Focus" },
    { workoutDayId: 3, workoutPlanId: 1, day: "Thursday",  title: "Full Body B" },
    { workoutDayId: 4, workoutPlanId: 2, day: "Monday",    title: "Lower Body And Core" },
    { workoutDayId: 5, workoutPlanId: 2, day: "Wednesday", title: "Upper Body Push" },
    { workoutDayId: 6, workoutPlanId: 2, day: "Friday",    title: "Upper Body Pull" }
];

// --- workout_day_exercises ---
let workoutDayExercises = [
    { id: 1,  workoutDayId: 1, exerciseId: 1, exerciseName: "Leg Press",         targetSets: 3, targetReps: 10, targetWeight: 80 },
    { id: 2,  workoutDayId: 1, exerciseId: 2, exerciseName: "Chest Press",        targetSets: 3, targetReps: 10, targetWeight: 35 },
    { id: 3,  workoutDayId: 1, exerciseId: 3, exerciseName: "Lat Pulldown",       targetSets: 3, targetReps: 10, targetWeight: 40 },
    { id: 4,  workoutDayId: 2, exerciseId: 4, exerciseName: "Shoulder Press",     targetSets: 3, targetReps: 10, targetWeight: 12 },
    { id: 5,  workoutDayId: 2, exerciseId: 5, exerciseName: "Biceps Curl",        targetSets: 3, targetReps: 12, targetWeight: 10 },
    { id: 6,  workoutDayId: 2, exerciseId: 6, exerciseName: "Triceps Pushdown",   targetSets: 3, targetReps: 12, targetWeight: 25 },
    { id: 7,  workoutDayId: 3, exerciseId: 1, exerciseName: "Leg Press",         targetSets: 4, targetReps:  8, targetWeight: 90 },
    { id: 8,  workoutDayId: 3, exerciseId: 3, exerciseName: "Lat Pulldown",       targetSets: 3, targetReps:  8, targetWeight: 45 },
    { id: 9,  workoutDayId: 3, exerciseId: 7, exerciseName: "Plank",              targetSets: 3, targetReps: 45, targetWeight:  0 },
    { id: 10, workoutDayId: 4, exerciseId: 1, exerciseName: "Leg Press",         targetSets: 3, targetReps: 12, targetWeight: 60 },
    { id: 11, workoutDayId: 4, exerciseId: 7, exerciseName: "Plank",              targetSets: 3, targetReps: 40, targetWeight:  0 },
    { id: 12, workoutDayId: 5, exerciseId: 2, exerciseName: "Chest Press",        targetSets: 3, targetReps: 10, targetWeight: 25 },
    { id: 13, workoutDayId: 5, exerciseId: 4, exerciseName: "Shoulder Press",     targetSets: 3, targetReps: 10, targetWeight:  8 },
    { id: 14, workoutDayId: 5, exerciseId: 6, exerciseName: "Triceps Pushdown",   targetSets: 3, targetReps: 12, targetWeight: 18 },
    { id: 15, workoutDayId: 6, exerciseId: 3, exerciseName: "Lat Pulldown",       targetSets: 3, targetReps: 10, targetWeight: 30 },
    { id: 16, workoutDayId: 6, exerciseId: 5, exerciseName: "Biceps Curl",        targetSets: 3, targetReps: 12, targetWeight:  7 },
    { id: 17, workoutDayId: 6, exerciseId: 7, exerciseName: "Plank",              targetSets: 3, targetReps: 45, targetWeight:  0 }
];

// --- assembly ---
function assemblePlan(plan) {
    const days = workoutDays
        .filter(d => d.workoutPlanId === plan.workoutPlanId)
        .map(d => ({
            ...d,
            exercises: workoutDayExercises.filter(e => e.workoutDayId === d.workoutDayId)
        }));
    return { ...plan, days };
}

// --- plan-level functions ---
const getAll = () => workoutPlans.map(assemblePlan);

const getById = (id) => {
    const plan = workoutPlans.find(p => p.workoutPlanId === id);
    return plan ? assemblePlan(plan) : null;
};

const getByUserId = (userId) =>
    workoutPlans.filter(p => p.userId === userId).map(assemblePlan);

const create = (data) => {
    const newPlan = {
        workoutPlanId: workoutPlans.length > 0 ? workoutPlans[workoutPlans.length - 1].workoutPlanId + 1 : 1,
        userId: data.userId,
        name: data.name,
        goal: data.goal,
        isActive: data.isActive,
        createdAt: new Date().toISOString().split("T")[0]
    };
    workoutPlans.push(newPlan);
    return assemblePlan(newPlan);
};

const update = (id, data) => {
    const index = workoutPlans.findIndex(p => p.workoutPlanId === id);
    if (index === -1) return null;
    workoutPlans[index] = { ...workoutPlans[index], name: data.name, goal: data.goal, isActive: data.isActive };
    return assemblePlan(workoutPlans[index]);
};

const remove = (id) => {
    const index = workoutPlans.findIndex(p => p.workoutPlanId === id);
    if (index === -1) return null;
    const dayIds = workoutDays.filter(d => d.workoutPlanId === id).map(d => d.workoutDayId);
    workoutDayExercises = workoutDayExercises.filter(e => !dayIds.includes(e.workoutDayId));
    workoutDays = workoutDays.filter(d => d.workoutPlanId !== id);
    return workoutPlans.splice(index, 1)[0];
};

// --- day-level functions ---
const getDays = (planId) => workoutDays.filter(d => d.workoutPlanId === planId);

const getDayById = (dayId) => workoutDays.find(d => d.workoutDayId === dayId) || null;

const createDay = (data) => {
    const newDay = {
        workoutDayId: workoutDays.length > 0 ? workoutDays[workoutDays.length - 1].workoutDayId + 1 : 1,
        workoutPlanId: data.workoutPlanId,
        day: data.day,
        title: data.title
    };
    workoutDays.push(newDay);
    return newDay;
};

const updateDay = (dayId, data) => {
    const index = workoutDays.findIndex(d => d.workoutDayId === dayId);
    if (index === -1) return null;
    workoutDays[index] = { ...workoutDays[index], day: data.day, title: data.title };
    return workoutDays[index];
};

const removeDay = (dayId) => {
    const index = workoutDays.findIndex(d => d.workoutDayId === dayId);
    if (index === -1) return null;
    workoutDayExercises = workoutDayExercises.filter(e => e.workoutDayId !== dayId);
    return workoutDays.splice(index, 1)[0];
};

// --- day-exercise-level functions ---
const getDayExercises = (dayId) => workoutDayExercises.filter(e => e.workoutDayId === dayId);

const getDayExerciseById = (id) => workoutDayExercises.find(e => e.id === id) || null;

const createDayExercise = (data) => {
    const newExercise = {
        id: workoutDayExercises.length > 0 ? workoutDayExercises[workoutDayExercises.length - 1].id + 1 : 1,
        workoutDayId: data.workoutDayId,
        exerciseId: data.exerciseId,
        exerciseName: data.exerciseName,
        targetSets: data.targetSets,
        targetReps: data.targetReps,
        targetWeight: data.targetWeight
    };
    workoutDayExercises.push(newExercise);
    return newExercise;
};

const updateDayExercise = (id, data) => {
    const index = workoutDayExercises.findIndex(e => e.id === id);
    if (index === -1) return null;
    workoutDayExercises[index] = { ...workoutDayExercises[index], ...data };
    return workoutDayExercises[index];
};

const removeDayExercise = (id) => {
    const index = workoutDayExercises.findIndex(e => e.id === id);
    if (index === -1) return null;
    return workoutDayExercises.splice(index, 1)[0];
};

module.exports = {
    getAll, getById, getByUserId, create, update, remove,
    getDays, getDayById, createDay, updateDay, removeDay,
    getDayExercises, getDayExerciseById, createDayExercise, updateDayExercise, removeDayExercise
};

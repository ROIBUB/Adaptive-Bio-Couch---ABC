// --- workout_plans ---
let workoutPlans = [
    { workoutPlanId: 1, userId: 1, name: "John Doe - 3 Day Muscle Gain Plan",  goal: "muscle gain", isActive: true, createdAt: "2026-05-05" },
    { workoutPlanId: 2, userId: 3, name: "Dana Cohen - 3 Day Muscle Gain Plan",    goal: "muscle gain", isActive: true, createdAt: "2026-05-05" },
    { workoutPlanId: 3, userId: 4, name: "Yossi Mizrahi - 3 Day Weight Loss Plan", goal: "weight_loss", isActive: true, createdAt: "2026-05-05" },
    { workoutPlanId: 4, userId: 2, name: "Noam Levi - 4 Day Weight Loss Plan",     goal: "weight_loss", isActive: true, createdAt: "2026-05-05" },
    { workoutPlanId: 5, userId: 5, name: "Maya Ben-David - 3 Day Maintenance Plan",goal: "maintenance", isActive: true, createdAt: "2026-05-05" },
    { workoutPlanId: 6, userId: 5, name: "Maya Ben-David - 5 Day Maintenance Plan",goal: "maintenance", isActive: true, createdAt: "2026-05-05" }
];

// --- workout_days ---
let workoutDays = [
    { workoutDayId: 1, workoutPlanId: 1, day: "Sunday",    title: "Full Body A" },
    { workoutDayId: 2, workoutPlanId: 1, day: "Tuesday",   title: "Upper Body Focus" },
    { workoutDayId: 3, workoutPlanId: 1, day: "Thursday",  title: "Full Body B" },
    { workoutDayId: 4, workoutPlanId: 2, day: "Monday",    title: "Lower Body And Core" },
    { workoutDayId: 5, workoutPlanId: 2, day: "Wednesday", title: "Upper Body Push" },
    { workoutDayId:  6, workoutPlanId: 2, day: "Friday",    title: "Upper Body Pull" },
    // Plan 3 — Weight Loss beginner 3-day
    { workoutDayId:  7, workoutPlanId: 3, day: "Monday",    title: "Full Body Circuit A" },
    { workoutDayId:  8, workoutPlanId: 3, day: "Wednesday", title: "Full Body Circuit B" },
    { workoutDayId:  9, workoutPlanId: 3, day: "Friday",    title: "Full Body Circuit C" },
    // Plan 4 — Weight Loss intermediate 4-day
    { workoutDayId: 10, workoutPlanId: 4, day: "Monday",    title: "Lower Body" },
    { workoutDayId: 11, workoutPlanId: 4, day: "Tuesday",   title: "Upper Body Push" },
    { workoutDayId: 12, workoutPlanId: 4, day: "Thursday",  title: "Full Body" },
    { workoutDayId: 13, workoutPlanId: 4, day: "Friday",    title: "Upper Body Pull" },
    // Plan 5 — Maintenance balanced 3-day
    { workoutDayId: 14, workoutPlanId: 5, day: "Tuesday",   title: "Lower Body" },
    { workoutDayId: 15, workoutPlanId: 5, day: "Thursday",  title: "Upper Body" },
    { workoutDayId: 16, workoutPlanId: 5, day: "Saturday",  title: "Full Body" },
    // Plan 6 — Maintenance advanced 5-day
    { workoutDayId: 17, workoutPlanId: 6, day: "Monday",    title: "Chest And Triceps" },
    { workoutDayId: 18, workoutPlanId: 6, day: "Tuesday",   title: "Back And Biceps" },
    { workoutDayId: 19, workoutPlanId: 6, day: "Wednesday", title: "Legs And Core" },
    { workoutDayId: 20, workoutPlanId: 6, day: "Thursday",  title: "Shoulders And Arms" },
    { workoutDayId: 21, workoutPlanId: 6, day: "Friday",    title: "Full Body" }
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
    { id: 17, workoutDayId:  6, exerciseId: 7, exerciseName: "Plank",           targetSets: 3, targetReps: 45, targetWeight:  0 },
    // Plan 3, Day 7 — Monday Full Body Circuit A (beginner, 15 reps, moderate weight)
    { id: 18, workoutDayId:  7, exerciseId: 1, exerciseName: "Leg Press",       targetSets: 3, targetReps: 15, targetWeight: 60 },
    { id: 19, workoutDayId:  7, exerciseId: 2, exerciseName: "Chest Press",     targetSets: 3, targetReps: 15, targetWeight: 20 },
    { id: 20, workoutDayId:  7, exerciseId: 3, exerciseName: "Lat Pulldown",    targetSets: 3, targetReps: 15, targetWeight: 30 },
    { id: 21, workoutDayId:  7, exerciseId: 7, exerciseName: "Plank",           targetSets: 3, targetReps: 30, targetWeight:  0 },
    // Plan 3, Day 8 — Wednesday Full Body Circuit B
    { id: 22, workoutDayId:  8, exerciseId: 1, exerciseName: "Leg Press",       targetSets: 3, targetReps: 12, targetWeight: 65 },
    { id: 23, workoutDayId:  8, exerciseId: 4, exerciseName: "Shoulder Press",  targetSets: 3, targetReps: 15, targetWeight:  8 },
    { id: 24, workoutDayId:  8, exerciseId: 5, exerciseName: "Biceps Curl",     targetSets: 3, targetReps: 15, targetWeight:  6 },
    { id: 25, workoutDayId:  8, exerciseId: 7, exerciseName: "Plank",           targetSets: 3, targetReps: 30, targetWeight:  0 },
    // Plan 3, Day 9 — Friday Full Body Circuit C
    { id: 26, workoutDayId:  9, exerciseId: 2, exerciseName: "Chest Press",      targetSets: 3, targetReps: 15, targetWeight: 20 },
    { id: 27, workoutDayId:  9, exerciseId: 3, exerciseName: "Lat Pulldown",     targetSets: 3, targetReps: 15, targetWeight: 30 },
    { id: 28, workoutDayId:  9, exerciseId: 6, exerciseName: "Triceps Pushdown", targetSets: 3, targetReps: 15, targetWeight: 15 },
    { id: 29, workoutDayId:  9, exerciseId: 7, exerciseName: "Plank",            targetSets: 3, targetReps: 45, targetWeight:  0 },
    // Plan 4, Day 10 — Monday Lower Body (intermediate, higher intensity)
    { id: 30, workoutDayId: 10, exerciseId: 1, exerciseName: "Leg Press",        targetSets: 4, targetReps: 15, targetWeight: 70 },
    { id: 31, workoutDayId: 10, exerciseId: 7, exerciseName: "Plank",            targetSets: 4, targetReps: 45, targetWeight:  0 },
    // Plan 4, Day 11 — Tuesday Upper Body Push
    { id: 32, workoutDayId: 11, exerciseId: 2, exerciseName: "Chest Press",      targetSets: 3, targetReps: 15, targetWeight: 25 },
    { id: 33, workoutDayId: 11, exerciseId: 4, exerciseName: "Shoulder Press",   targetSets: 3, targetReps: 15, targetWeight: 10 },
    { id: 34, workoutDayId: 11, exerciseId: 6, exerciseName: "Triceps Pushdown", targetSets: 3, targetReps: 15, targetWeight: 20 },
    // Plan 4, Day 12 — Thursday Full Body
    { id: 35, workoutDayId: 12, exerciseId: 1, exerciseName: "Leg Press",        targetSets: 3, targetReps: 15, targetWeight: 75 },
    { id: 36, workoutDayId: 12, exerciseId: 3, exerciseName: "Lat Pulldown",     targetSets: 3, targetReps: 15, targetWeight: 35 },
    { id: 37, workoutDayId: 12, exerciseId: 7, exerciseName: "Plank",            targetSets: 3, targetReps: 45, targetWeight:  0 },
    // Plan 4, Day 13 — Friday Upper Body Pull
    { id: 38, workoutDayId: 13, exerciseId: 3, exerciseName: "Lat Pulldown",     targetSets: 3, targetReps: 15, targetWeight: 35 },
    { id: 39, workoutDayId: 13, exerciseId: 5, exerciseName: "Biceps Curl",      targetSets: 3, targetReps: 15, targetWeight:  8 },
    { id: 40, workoutDayId: 13, exerciseId: 4, exerciseName: "Shoulder Press",   targetSets: 3, targetReps: 15, targetWeight: 10 },
    // Plan 5, Day 14 — Tuesday Lower Body (maintenance balanced)
    { id: 41, workoutDayId: 14, exerciseId: 1, exerciseName: "Leg Press",        targetSets: 3, targetReps: 10, targetWeight: 80 },
    { id: 42, workoutDayId: 14, exerciseId: 7, exerciseName: "Plank",            targetSets: 3, targetReps: 40, targetWeight:  0 },
    // Plan 5, Day 15 — Thursday Upper Body
    { id: 43, workoutDayId: 15, exerciseId: 2, exerciseName: "Chest Press",      targetSets: 3, targetReps: 10, targetWeight: 30 },
    { id: 44, workoutDayId: 15, exerciseId: 3, exerciseName: "Lat Pulldown",     targetSets: 3, targetReps: 10, targetWeight: 35 },
    { id: 45, workoutDayId: 15, exerciseId: 4, exerciseName: "Shoulder Press",   targetSets: 3, targetReps: 10, targetWeight: 12 },
    // Plan 5, Day 16 — Saturday Full Body
    { id: 46, workoutDayId: 16, exerciseId: 1, exerciseName: "Leg Press",        targetSets: 3, targetReps: 10, targetWeight: 80 },
    { id: 47, workoutDayId: 16, exerciseId: 2, exerciseName: "Chest Press",      targetSets: 3, targetReps: 10, targetWeight: 30 },
    { id: 48, workoutDayId: 16, exerciseId: 5, exerciseName: "Biceps Curl",      targetSets: 3, targetReps: 12, targetWeight: 10 },
    { id: 49, workoutDayId: 16, exerciseId: 6, exerciseName: "Triceps Pushdown", targetSets: 3, targetReps: 12, targetWeight: 20 },
    { id: 50, workoutDayId: 16, exerciseId: 7, exerciseName: "Plank",            targetSets: 3, targetReps: 45, targetWeight:  0 },
    // Plan 6, Day 17 — Monday Chest And Triceps (maintenance advanced 5-day)
    { id: 51, workoutDayId: 17, exerciseId: 2, exerciseName: "Chest Press",      targetSets: 4, targetReps: 10, targetWeight: 40 },
    { id: 52, workoutDayId: 17, exerciseId: 6, exerciseName: "Triceps Pushdown", targetSets: 3, targetReps: 12, targetWeight: 30 },
    // Plan 6, Day 18 — Tuesday Back And Biceps
    { id: 53, workoutDayId: 18, exerciseId: 3, exerciseName: "Lat Pulldown",     targetSets: 4, targetReps: 10, targetWeight: 50 },
    { id: 54, workoutDayId: 18, exerciseId: 5, exerciseName: "Biceps Curl",      targetSets: 3, targetReps: 12, targetWeight: 12 },
    // Plan 6, Day 19 — Wednesday Legs And Core
    { id: 55, workoutDayId: 19, exerciseId: 1, exerciseName: "Leg Press",        targetSets: 4, targetReps: 10, targetWeight: 100 },
    { id: 56, workoutDayId: 19, exerciseId: 7, exerciseName: "Plank",            targetSets: 4, targetReps: 60, targetWeight:   0 },
    // Plan 6, Day 20 — Thursday Shoulders And Arms
    { id: 57, workoutDayId: 20, exerciseId: 4, exerciseName: "Shoulder Press",   targetSets: 4, targetReps: 10, targetWeight: 16 },
    { id: 58, workoutDayId: 20, exerciseId: 5, exerciseName: "Biceps Curl",      targetSets: 3, targetReps: 12, targetWeight: 12 },
    { id: 59, workoutDayId: 20, exerciseId: 6, exerciseName: "Triceps Pushdown", targetSets: 3, targetReps: 12, targetWeight: 30 },
    // Plan 6, Day 21 — Friday Full Body
    { id: 60, workoutDayId: 21, exerciseId: 1, exerciseName: "Leg Press",        targetSets: 3, targetReps: 12, targetWeight:  90 },
    { id: 61, workoutDayId: 21, exerciseId: 2, exerciseName: "Chest Press",      targetSets: 3, targetReps: 12, targetWeight:  35 },
    { id: 62, workoutDayId: 21, exerciseId: 3, exerciseName: "Lat Pulldown",     targetSets: 3, targetReps: 12, targetWeight:  45 },
    { id: 63, workoutDayId: 21, exerciseId: 7, exerciseName: "Plank",            targetSets: 3, targetReps: 60, targetWeight:   0 }
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
    workoutPlans.filter(p => p.userId === userId && p.isActive === true).map(assemblePlan);

const deactivateByUserId = (userId) => {
    workoutPlans
        .filter(p => p.userId === userId)
        .forEach(p => { p.isActive = false; });
};

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
    getAll, getById, getByUserId, deactivateByUserId, create, update, remove,
    getDays, getDayById, createDay, updateDay, removeDay,
    getDayExercises, getDayExerciseById, createDayExercise, updateDayExercise, removeDayExercise
};

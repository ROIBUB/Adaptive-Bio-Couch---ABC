// --- workout_logs ---
let workoutLogs = [
    { workoutLogId: 1, userId: 1, workoutPlanId: 1, workoutDayId: 1, date: "2026-05-06", workoutTitle: "Full Body A",         durationMinutes: 60, difficultyRating: 8, notes: "Good workout, leg press felt challenging." },
    { workoutLogId: 2, userId: 1, workoutPlanId: 1, workoutDayId: 2, date: "2026-05-08", workoutTitle: "Upper Body Focus",    durationMinutes: 55, difficultyRating: 7, notes: "Shoulder press was difficult in the last set." },
    { workoutLogId: 3, userId: 3, workoutPlanId: 2, workoutDayId: 4, date: "2026-05-07", workoutTitle: "Lower Body And Core", durationMinutes: 45, difficultyRating: 6, notes: "Completed all planned leg press sets." }
];

// --- workout_log_exercises ---
let workoutLogExercises = [
    { id: 1, workoutLogId: 1, exerciseId: 1, exerciseName: "Leg Press" },
    { id: 2, workoutLogId: 1, exerciseId: 2, exerciseName: "Chest Press" },
    { id: 3, workoutLogId: 1, exerciseId: 3, exerciseName: "Lat Pulldown" },
    { id: 4, workoutLogId: 2, exerciseId: 4, exerciseName: "Shoulder Press" },
    { id: 5, workoutLogId: 2, exerciseId: 5, exerciseName: "Biceps Curl" },
    { id: 6, workoutLogId: 2, exerciseId: 6, exerciseName: "Triceps Pushdown" },
    { id: 7, workoutLogId: 3, exerciseId: 1, exerciseName: "Leg Press" },
    { id: 8, workoutLogId: 3, exerciseId: 7, exerciseName: "Plank" }
];

// --- workout_log_sets ---
let workoutLogSets = [
    { setId: 1,  workoutLogExerciseId: 1, setNumber: 1, reps: 10, weight: 80 },
    { setId: 2,  workoutLogExerciseId: 1, setNumber: 2, reps: 10, weight: 80 },
    { setId: 3,  workoutLogExerciseId: 1, setNumber: 3, reps:  9, weight: 80 },
    { setId: 4,  workoutLogExerciseId: 2, setNumber: 1, reps: 10, weight: 35 },
    { setId: 5,  workoutLogExerciseId: 2, setNumber: 2, reps: 10, weight: 35 },
    { setId: 6,  workoutLogExerciseId: 2, setNumber: 3, reps:  8, weight: 35 },
    { setId: 7,  workoutLogExerciseId: 3, setNumber: 1, reps: 10, weight: 40 },
    { setId: 8,  workoutLogExerciseId: 3, setNumber: 2, reps:  9, weight: 40 },
    { setId: 9,  workoutLogExerciseId: 3, setNumber: 3, reps:  8, weight: 40 },
    { setId: 10, workoutLogExerciseId: 4, setNumber: 1, reps: 10, weight: 12 },
    { setId: 11, workoutLogExerciseId: 4, setNumber: 2, reps:  9, weight: 12 },
    { setId: 12, workoutLogExerciseId: 4, setNumber: 3, reps:  8, weight: 12 },
    { setId: 13, workoutLogExerciseId: 5, setNumber: 1, reps: 12, weight: 10 },
    { setId: 14, workoutLogExerciseId: 5, setNumber: 2, reps: 11, weight: 10 },
    { setId: 15, workoutLogExerciseId: 5, setNumber: 3, reps: 10, weight: 10 },
    { setId: 16, workoutLogExerciseId: 6, setNumber: 1, reps: 12, weight: 25 },
    { setId: 17, workoutLogExerciseId: 6, setNumber: 2, reps: 12, weight: 25 },
    { setId: 18, workoutLogExerciseId: 6, setNumber: 3, reps: 10, weight: 25 },
    { setId: 19, workoutLogExerciseId: 7, setNumber: 1, reps: 12, weight: 60 },
    { setId: 20, workoutLogExerciseId: 7, setNumber: 2, reps: 12, weight: 60 },
    { setId: 21, workoutLogExerciseId: 7, setNumber: 3, reps: 12, weight: 60 },
    { setId: 22, workoutLogExerciseId: 8, setNumber: 1, reps: 40, weight: 0 },
    { setId: 23, workoutLogExerciseId: 8, setNumber: 2, reps: 35, weight: 0 },
    { setId: 24, workoutLogExerciseId: 8, setNumber: 3, reps: 30, weight: 0 }
];

// --- assembly ---
function assembleLog(log) {
    const exercises = workoutLogExercises
        .filter(e => e.workoutLogId === log.workoutLogId)
        .map(e => ({
            ...e,
            sets: workoutLogSets.filter(s => s.workoutLogExerciseId === e.id)
        }));
    return { ...log, exercises };
}

// --- log-level functions ---
const getAll = () => workoutLogs.map(assembleLog);

const getById = (id) => {
    const log = workoutLogs.find(l => l.workoutLogId === id);
    return log ? assembleLog(log) : null;
};

const getByUserId = (userId) =>
    workoutLogs.filter(l => l.userId === userId).map(assembleLog);

const create = (data) => {
    const newLog = {
        workoutLogId: workoutLogs.length > 0 ? workoutLogs[workoutLogs.length - 1].workoutLogId + 1 : 1,
        userId: data.userId,
        workoutPlanId: data.workoutPlanId,
        workoutDayId: data.workoutDayId || null,
        date: data.date,
        workoutTitle: data.workoutTitle,
        durationMinutes: data.durationMinutes,
        difficultyRating: data.difficultyRating,
        notes: data.notes || ""
    };
    workoutLogs.push(newLog);
    return assembleLog(newLog);
};

const update = (id, data) => {
    const index = workoutLogs.findIndex(l => l.workoutLogId === id);
    if (index === -1) return null;
    workoutLogs[index] = {
        ...workoutLogs[index],
        workoutPlanId: data.workoutPlanId,
        date: data.date,
        workoutTitle: data.workoutTitle,
        durationMinutes: data.durationMinutes,
        difficultyRating: data.difficultyRating,
        notes: data.notes || ""
    };
    return assembleLog(workoutLogs[index]);
};

const remove = (id) => {
    const index = workoutLogs.findIndex(l => l.workoutLogId === id);
    if (index === -1) return null;
    const exerciseIds = workoutLogExercises
        .filter(e => e.workoutLogId === id)
        .map(e => e.id);
    workoutLogSets = workoutLogSets.filter(s => !exerciseIds.includes(s.workoutLogExerciseId));
    workoutLogExercises = workoutLogExercises.filter(e => e.workoutLogId !== id);
    return workoutLogs.splice(index, 1)[0];
};

// --- log-exercise-level functions ---
const getLogExercises = (logId) => workoutLogExercises.filter(e => e.workoutLogId === logId);

const getLogExerciseById = (id) => workoutLogExercises.find(e => e.id === id) || null;

const createLogExercise = (data) => {
    const newExercise = {
        id: workoutLogExercises.length > 0 ? workoutLogExercises[workoutLogExercises.length - 1].id + 1 : 1,
        workoutLogId: data.workoutLogId,
        exerciseId: data.exerciseId,
        exerciseName: data.exerciseName
    };
    workoutLogExercises.push(newExercise);
    return newExercise;
};

const updateLogExercise = (id, data) => {
    const index = workoutLogExercises.findIndex(e => e.id === id);
    if (index === -1) return null;
    workoutLogExercises[index] = { ...workoutLogExercises[index], ...data };
    return workoutLogExercises[index];
};

const removeLogExercise = (id) => {
    const index = workoutLogExercises.findIndex(e => e.id === id);
    if (index === -1) return null;
    workoutLogSets = workoutLogSets.filter(s => s.workoutLogExerciseId !== id);
    return workoutLogExercises.splice(index, 1)[0];
};

// --- log-set-level functions ---
const getLogSets = (logExerciseId) => workoutLogSets.filter(s => s.workoutLogExerciseId === logExerciseId);

const getLogSetById = (setId) => workoutLogSets.find(s => s.setId === setId) || null;

const createLogSet = (data) => {
    const newSet = {
        setId: workoutLogSets.length > 0 ? workoutLogSets[workoutLogSets.length - 1].setId + 1 : 1,
        workoutLogExerciseId: data.workoutLogExerciseId,
        setNumber: data.setNumber,
        reps: data.reps,
        weight: data.weight
    };
    workoutLogSets.push(newSet);
    return newSet;
};

const updateLogSet = (setId, data) => {
    const index = workoutLogSets.findIndex(s => s.setId === setId);
    if (index === -1) return null;
    workoutLogSets[index] = { ...workoutLogSets[index], ...data };
    return workoutLogSets[index];
};

const removeLogSet = (setId) => {
    const index = workoutLogSets.findIndex(s => s.setId === setId);
    if (index === -1) return null;
    return workoutLogSets.splice(index, 1)[0];
};

module.exports = {
    getAll, getById, getByUserId, create, update, remove,
    getLogExercises, getLogExerciseById, createLogExercise, updateLogExercise, removeLogExercise,
    getLogSets, getLogSetById, createLogSet, updateLogSet, removeLogSet
};

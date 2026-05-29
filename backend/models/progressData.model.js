let progressData = [
    { progressId: 1, userId: 1, date: '2026-05-20', caloriesConsumed: 2650, workoutsCompleted: 1, activeMinutes: 60 },
    { progressId: 2, userId: 1, date: '2026-05-21', caloriesConsumed: 2800, workoutsCompleted: 0, activeMinutes: 20 },
    { progressId: 3, userId: 1, date: '2026-05-22', caloriesConsumed: 2700, workoutsCompleted: 1, activeMinutes: 55 },
    { progressId: 4, userId: 3, date: '2026-05-20', caloriesConsumed: 2200, workoutsCompleted: 1, activeMinutes: 45 },
    { progressId: 5, userId: 3, date: '2026-05-22', caloriesConsumed: 2350, workoutsCompleted: 0, activeMinutes: 15 }
];

const getAll = () => progressData;

const getById = (id) => progressData.find(p => p.progressId === id) || null;

const getByUserId = (userId) => progressData.filter(p => p.userId === userId);

const getByUserAndDate = (userId, date) =>
    progressData.find(p => p.userId === userId && p.date === date) || null;

const create = (data) => {
    const newRecord = {
        progressId: progressData.length > 0 ? progressData[progressData.length - 1].progressId + 1 : 1,
        userId: data.userId,
        date: data.date,
        caloriesConsumed: data.caloriesConsumed,
        workoutsCompleted: data.workoutsCompleted,
        activeMinutes: data.activeMinutes
    };
    progressData.push(newRecord);
    return newRecord;
};

const update = (id, data) => {
    const index = progressData.findIndex(p => p.progressId === id);
    if (index === -1) return null;
    progressData[index] = { ...progressData[index], ...data };
    return progressData[index];
};

module.exports = { getAll, getById, getByUserId, getByUserAndDate, create, update };

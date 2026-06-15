const prisma = require('../prisma/prismaClient');
const { toDateOnly } = require('./_dateUtils');

const mapProgress = (p) => ({
    progressId: p.id,
    userId: p.user_id,
    date: toDateOnly(p.date),
    caloriesConsumed: p.calories_consumed,
    workoutsCompleted: p.workouts_completed,
    activeMinutes: p.active_minutes
});

const getAll = async () => {
    const records = await prisma.progress.findMany();
    return records.map(mapProgress);
};

const getById = async (id) => {
    const record = await prisma.progress.findUnique({ where: { id } });
    return record ? mapProgress(record) : null;
};

const getByUserId = async (userId) => {
    const records = await prisma.progress.findMany({ where: { user_id: userId } });
    return records.map(mapProgress);
};

const getByUserAndDate = async (userId, date) => {
    const record = await prisma.progress.findUnique({
        where: { user_id_date: { user_id: userId, date: new Date(date) } }
    });
    return record ? mapProgress(record) : null;
};

const create = async (data) => {
    const created = await prisma.progress.create({
        data: {
            user_id: data.userId,
            date: new Date(data.date),
            calories_consumed: data.caloriesConsumed,
            workouts_completed: data.workoutsCompleted,
            active_minutes: data.activeMinutes
        }
    });
    return mapProgress(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.progress.update({
            where: { id },
            data: {
                date: new Date(data.date),
                calories_consumed: data.caloriesConsumed,
                workouts_completed: data.workoutsCompleted,
                active_minutes: data.activeMinutes
            }
        });
        return mapProgress(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = { getAll, getById, getByUserId, getByUserAndDate, create, update };

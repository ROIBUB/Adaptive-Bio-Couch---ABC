const prisma = require('../prisma/prismaClient');
const { toDateOnly } = require('./_dateUtils');

const mapCheckIn = (ci) => ({
    checkInId: ci.id,
    userId: ci.user_id,
    weight: ci.weight,
    workoutsCompleted: ci.workouts_completed,
    feedback: ci.feedback,
    checkInDate: toDateOnly(ci.check_in_date)
});

const getAll = async () => {
    const checkIns = await prisma.checkIn.findMany();
    return checkIns.map(mapCheckIn);
};

const getById = async (id) => {
    const checkIn = await prisma.checkIn.findUnique({ where: { id } });
    return checkIn ? mapCheckIn(checkIn) : null;
};

const getByUserId = async (userId) => {
    const checkIns = await prisma.checkIn.findMany({ where: { user_id: userId } });
    return checkIns.map(mapCheckIn);
};

const create = async (data) => {
    const created = await prisma.checkIn.create({
        data: {
            user_id: data.userId,
            weight: data.weight,
            workouts_completed: data.workoutsCompleted,
            feedback: data.feedback || "",
            check_in_date: new Date(data.checkInDate)
        }
    });
    return mapCheckIn(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.checkIn.update({
            where: { id },
            data: {
                weight: data.weight,
                workouts_completed: data.workoutsCompleted,
                feedback: data.feedback || "",
                check_in_date: new Date(data.checkInDate)
            }
        });
        return mapCheckIn(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const remove = async (id) => {
    try {
        const deleted = await prisma.checkIn.delete({ where: { id } });
        return mapCheckIn(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = { getAll, getById, getByUserId, create, update, remove };

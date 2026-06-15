const prisma = require('../prisma/prismaClient');

const mapSettings = (s) => ({
    userId: s.user_id,
    displayName: s.display_name,
    email: s.email,
    theme: s.theme,
    fitnessGoal: s.fitness_goal,
    activityLevel: s.activity_level
});

const getByUserId = async (userId) => {
    const settings = await prisma.setting.findUnique({ where: { user_id: userId } });
    return settings ? mapSettings(settings) : null;
};

const create = async (data) => {
    const activityLevel = Number(data.activityLevel);
    const created = await prisma.setting.create({
        data: {
            user_id: data.userId,
            display_name: data.displayName,
            email: data.email,
            theme: 'light',
            fitness_goal: data.fitnessGoal || '',
            activity_level: Number.isFinite(activityLevel) ? activityLevel : null
        }
    });
    return mapSettings(created);
};

const update = async (userId, data) => {
    const updateData = {};
    if (data.displayName !== undefined) updateData.display_name = data.displayName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.fitnessGoal !== undefined) updateData.fitness_goal = data.fitnessGoal;
    if (data.activityLevel !== undefined) {
        const activityLevel = Number(data.activityLevel);
        updateData.activity_level = Number.isFinite(activityLevel) ? activityLevel : null;
    }

    try {
        const updated = await prisma.setting.update({
            where: { user_id: userId },
            data: updateData
        });
        return mapSettings(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = { getByUserId, create, update };

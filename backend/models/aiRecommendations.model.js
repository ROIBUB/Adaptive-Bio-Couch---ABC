const prisma = require('../prisma/prismaClient');

const mapRecommendation = (r) => ({
    recommendationId: r.id,
    userId: r.user_id,
    generatedAt: r.generated_at,
    weightAssessment: r.weight_assessment,
    nutritionAssessment: r.nutrition_assessment,
    workoutAssessment: r.workout_assessment,
    recommendations: r.recommendations
});

const create = async (data) => {
    const created = await prisma.aiRecommendation.create({
        data: {
            user_id: data.userId,
            weight_assessment: data.weightAssessment,
            nutrition_assessment: data.nutritionAssessment,
            workout_assessment: data.workoutAssessment,
            recommendations: data.recommendations
        }
    });
    return mapRecommendation(created);
};

const getByUserId = async (userId) => {
    const records = await prisma.aiRecommendation.findMany({
        where: { user_id: userId },
        orderBy: { generated_at: 'desc' }
    });
    return records.map(mapRecommendation);
};

const getLatestByUserId = async (userId) => {
    const record = await prisma.aiRecommendation.findFirst({
        where: { user_id: userId },
        orderBy: { generated_at: 'desc' }
    });
    return record ? mapRecommendation(record) : null;
};

module.exports = { create, getByUserId, getLatestByUserId };

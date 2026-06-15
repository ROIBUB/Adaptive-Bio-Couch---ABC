const prisma = require('../prisma/prismaClient');

const mapProfile = (p) => ({
    profileId: p.id,
    userId: p.user_id,
    age: p.age,
    gender: p.gender,
    height: p.height_cm,
    currentWeight: p.current_weight,
    targetWeight: p.target_weight,
    fitnessGoal: p.fitness_goal,
    activityLevel: p.activity_level,
    workoutsPerWeek: p.workouts_per_week,
    mealsPerDay: p.meals_per_day,
    onboardingCompleted: p.onboarding_completed,
    caloricTarget: p.caloric_target,
    assignedWorkoutPlanId: p.assigned_workout_plan_id,
    assignedMealPlanId: p.assigned_meal_plan_id
});

const getByUserId = async (userId) => {
    const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
    return profile ? mapProfile(profile) : null;
};

const create = async (data) => {
    const created = await prisma.profile.create({
        data: {
            user_id: data.userId,
            age: data.age ?? null,
            gender: data.gender ?? null,
            height_cm: data.height ?? null,
            current_weight: data.currentWeight ?? null,
            target_weight: data.targetWeight ?? null,
            fitness_goal: data.fitnessGoal,
            activity_level: data.activityLevel ?? 'beginner',
            workouts_per_week: data.workoutsPerWeek,
            meals_per_day: data.mealsPerDay,
            onboarding_completed: data.onboardingCompleted
        }
    });
    return mapProfile(created);
};

const update = async (userId, data) => {
    const updateData = {};
    if (data.age !== undefined) updateData.age = data.age;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.height !== undefined) updateData.height_cm = data.height;
    if (data.currentWeight !== undefined) updateData.current_weight = data.currentWeight;
    if (data.targetWeight !== undefined) updateData.target_weight = data.targetWeight;
    if (data.fitnessGoal !== undefined) updateData.fitness_goal = data.fitnessGoal;
    if (data.activityLevel !== undefined) updateData.activity_level = data.activityLevel;
    if (data.workoutsPerWeek !== undefined) updateData.workouts_per_week = data.workoutsPerWeek;
    if (data.mealsPerDay !== undefined) updateData.meals_per_day = data.mealsPerDay;
    if (data.onboardingCompleted !== undefined) updateData.onboarding_completed = data.onboardingCompleted;
    if (data.caloricTarget !== undefined) updateData.caloric_target = data.caloricTarget;
    if (data.assignedWorkoutPlanId !== undefined) updateData.assigned_workout_plan_id = data.assignedWorkoutPlanId;
    if (data.assignedMealPlanId !== undefined) updateData.assigned_meal_plan_id = data.assignedMealPlanId;

    try {
        const updated = await prisma.profile.update({
            where: { user_id: userId },
            data: updateData
        });
        return mapProfile(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = { getByUserId, create, update };

const prisma = require('../prisma/prismaClient');
const { toDateOnly } = require('./_dateUtils');

const mapMealFoodItem = (fi) => ({
    id: fi.id,
    mealId: fi.meal_id,
    foodItemId: fi.food_item_id,
    foodName: fi.food_name,
    quantityGrams: fi.quantity_grams
});

const mapMeal = (m) => ({
    mealId: m.id,
    dailyMealPlanId: m.daily_meal_plan_id,
    mealType: m.meal_type,
    title: m.title,
    estimatedCalories: m.estimated_calories,
    estimatedProtein: m.estimated_protein,
    foodItems: (m.mealFoodItems || []).map(mapMealFoodItem)
});

const mapMealFlat = (m) => ({
    mealId: m.id,
    dailyMealPlanId: m.daily_meal_plan_id,
    mealType: m.meal_type,
    title: m.title,
    estimatedCalories: m.estimated_calories,
    estimatedProtein: m.estimated_protein
});

const mapPlan = (p) => ({
    dailyMealPlanId: p.id,
    userId: p.user_id,
    name: p.plan_name,
    goal: p.fitness_goal,
    targetCalories: p.target_calories,
    targetProtein: p.target_protein,
    isActive: p.is_active,
    createdAt: toDateOnly(p.created_at),
    meals: (p.meals || []).map(mapMeal)
});

const planInclude = { meals: { include: { mealFoodItems: true } } };

// --- plan-level functions ---
const getAll = async () => {
    const plans = await prisma.dailyMealPlan.findMany({ include: planInclude });
    return plans.map(mapPlan);
};

const getById = async (id) => {
    const plan = await prisma.dailyMealPlan.findUnique({ where: { id }, include: planInclude });
    return plan ? mapPlan(plan) : null;
};

const getByUserId = async (userId) => {
    const plans = await prisma.dailyMealPlan.findMany({
        where: { user_id: userId, is_active: true },
        include: planInclude
    });
    return plans.map(mapPlan);
};

const deactivateByUserId = async (userId) => {
    await prisma.dailyMealPlan.updateMany({
        where: { user_id: userId },
        data: { is_active: false }
    });
};

const create = async (data) => {
    const created = await prisma.dailyMealPlan.create({
        data: {
            user_id: data.userId,
            plan_name: data.name,
            fitness_goal: data.goal,
            target_calories: data.targetCalories,
            target_protein: data.targetProtein,
            is_active: data.isActive,
            created_at: new Date()
        },
        include: planInclude
    });
    return mapPlan(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.dailyMealPlan.update({
            where: { id },
            data: {
                plan_name: data.name,
                fitness_goal: data.goal,
                target_calories: data.targetCalories,
                target_protein: data.targetProtein,
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
        const deleted = await prisma.dailyMealPlan.delete({ where: { id } });
        return {
            dailyMealPlanId: deleted.id,
            userId: deleted.user_id,
            name: deleted.plan_name,
            goal: deleted.fitness_goal,
            targetCalories: deleted.target_calories,
            targetProtein: deleted.target_protein,
            isActive: deleted.is_active,
            createdAt: toDateOnly(deleted.created_at)
        };
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

// --- meal-level functions ---
const getMeals = async (planId) => {
    const meals = await prisma.meal.findMany({ where: { daily_meal_plan_id: planId } });
    return meals.map(mapMealFlat);
};

const getMealById = async (mealId) => {
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    return meal ? mapMealFlat(meal) : null;
};

const createMeal = async (data) => {
    const created = await prisma.meal.create({
        data: {
            daily_meal_plan_id: data.dailyMealPlanId,
            meal_type: data.mealType,
            title: data.title,
            estimated_calories: data.estimatedCalories,
            estimated_protein: data.estimatedProtein
        }
    });
    return mapMealFlat(created);
};

const updateMeal = async (mealId, data) => {
    const updateData = {};
    if (data.dailyMealPlanId !== undefined) updateData.daily_meal_plan_id = data.dailyMealPlanId;
    if (data.mealType !== undefined) updateData.meal_type = data.mealType;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.estimatedCalories !== undefined) updateData.estimated_calories = data.estimatedCalories;
    if (data.estimatedProtein !== undefined) updateData.estimated_protein = data.estimatedProtein;

    try {
        const updated = await prisma.meal.update({ where: { id: mealId }, data: updateData });
        return mapMealFlat(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const removeMeal = async (mealId) => {
    try {
        const deleted = await prisma.meal.delete({ where: { id: mealId } });
        return mapMealFlat(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

// --- meal-food-item-level functions ---
const getMealFoodItems = async (mealId) => {
    const items = await prisma.mealFoodItem.findMany({ where: { meal_id: mealId } });
    return items.map(mapMealFoodItem);
};

const getMealFoodItemById = async (id) => {
    const item = await prisma.mealFoodItem.findUnique({ where: { id } });
    return item ? mapMealFoodItem(item) : null;
};

const createMealFoodItem = async (data) => {
    const created = await prisma.mealFoodItem.create({
        data: {
            meal_id: data.mealId,
            food_item_id: data.foodItemId,
            food_name: data.foodName,
            quantity_grams: data.quantityGrams
        }
    });
    return mapMealFoodItem(created);
};

const updateMealFoodItem = async (id, data) => {
    const updateData = {};
    if (data.mealId !== undefined) updateData.meal_id = data.mealId;
    if (data.foodItemId !== undefined) updateData.food_item_id = data.foodItemId;
    if (data.foodName !== undefined) updateData.food_name = data.foodName;
    if (data.quantityGrams !== undefined) updateData.quantity_grams = data.quantityGrams;

    try {
        const updated = await prisma.mealFoodItem.update({ where: { id }, data: updateData });
        return mapMealFoodItem(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const removeMealFoodItem = async (id) => {
    try {
        const deleted = await prisma.mealFoodItem.delete({ where: { id } });
        return mapMealFoodItem(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = {
    getAll, getById, getByUserId, deactivateByUserId, create, update, remove,
    getMeals, getMealById, createMeal, updateMeal, removeMeal,
    getMealFoodItems, getMealFoodItemById, createMealFoodItem, updateMealFoodItem, removeMealFoodItem
};

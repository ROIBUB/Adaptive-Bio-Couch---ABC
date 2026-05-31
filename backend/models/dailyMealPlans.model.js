// --- daily_meal_plans ---
let dailyMealPlans = [
    { dailyMealPlanId: 1, userId: 1, name: "John Doe - Muscle Gain Daily Meal Plan",  goal: "muscle gain", targetCalories: 2800, targetProtein: 150, isActive: true, createdAt: "2026-05-05" },
    { dailyMealPlanId: 2, userId: 3, name: "Dana Cohen - Muscle Gain Daily Meal Plan",          goal: "muscle gain", targetCalories: 2300, targetProtein: 120, isActive: true, createdAt: "2026-05-05" },
    { dailyMealPlanId: 3, userId: 4, name: "Yossi Mizrahi - Weight Loss Daily Meal Plan",       goal: "weight_loss", targetCalories: 1800, targetProtein: 130, isActive: true, createdAt: "2026-05-05" },
    { dailyMealPlanId: 4, userId: 2, name: "Noam Levi - Weight Loss Daily Meal Plan",           goal: "weight_loss", targetCalories: 1600, targetProtein: 110, isActive: true, createdAt: "2026-05-05" },
    { dailyMealPlanId: 5, userId: 5, name: "Maya Ben-David - Maintenance Daily Meal Plan",      goal: "maintenance", targetCalories: 2200, targetProtein: 130, isActive: true, createdAt: "2026-05-05" },
    { dailyMealPlanId: 6, userId: 5, name: "Maya Ben-David - Active Maintenance Daily Meal Plan",goal: "maintenance", targetCalories: 2500, targetProtein: 150, isActive: true, createdAt: "2026-05-05" }
];

// --- meals ---
let meals = [
    { mealId: 1, dailyMealPlanId: 1, mealType: "Breakfast", title: "Greek Yogurt With Oats",  estimatedCalories: 550, estimatedProtein: 35 },
    { mealId: 2, dailyMealPlanId: 1, mealType: "Lunch",     title: "Chicken Breast With Rice", estimatedCalories: 750, estimatedProtein: 55 },
    { mealId: 3, dailyMealPlanId: 1, mealType: "Dinner",    title: "Salmon With Sweet Potato", estimatedCalories: 800, estimatedProtein: 45 },
    { mealId: 4, dailyMealPlanId: 1, mealType: "Snack",     title: "Cottage Cheese And Egg",   estimatedCalories: 350, estimatedProtein: 30 },
    { mealId: 5, dailyMealPlanId: 2, mealType: "Breakfast", title: "Greek Yogurt Bowl",        estimatedCalories: 450, estimatedProtein: 30 },
    { mealId: 6, dailyMealPlanId: 2, mealType: "Lunch",     title: "Chicken Rice Bowl",        estimatedCalories: 650, estimatedProtein: 45 },
    { mealId: 7, dailyMealPlanId: 2, mealType: "Dinner",    title: "Eggs With Sweet Potato",   estimatedCalories: 600, estimatedProtein: 35 },
    { mealId:  8, dailyMealPlanId: 2, mealType: "Snack",     title: "Cottage Cheese Snack",          estimatedCalories: 300, estimatedProtein:  25 },
    // Plan 3 — Weight Loss ~1800 kcal, high protein
    { mealId:  9, dailyMealPlanId: 3, mealType: "Breakfast", title: "Oats And Greek Yogurt Bowl",    estimatedCalories: 400, estimatedProtein:  28 },
    { mealId: 10, dailyMealPlanId: 3, mealType: "Lunch",     title: "Chicken And Rice With Broccoli",estimatedCalories: 580, estimatedProtein:  68 },
    { mealId: 11, dailyMealPlanId: 3, mealType: "Dinner",    title: "Salmon And Sweet Potato",       estimatedCalories: 560, estimatedProtein:  40 },
    { mealId: 12, dailyMealPlanId: 3, mealType: "Snack",     title: "Cottage Cheese",                estimatedCalories: 260, estimatedProtein:  29 },
    // Plan 4 — Weight Loss ~1600 kcal, lighter deficit
    { mealId: 13, dailyMealPlanId: 4, mealType: "Breakfast", title: "Scrambled Eggs With Broccoli",  estimatedCalories: 360, estimatedProtein:  30 },
    { mealId: 14, dailyMealPlanId: 4, mealType: "Lunch",     title: "Chicken And Sweet Potato",      estimatedCalories: 470, estimatedProtein:  59 },
    { mealId: 15, dailyMealPlanId: 4, mealType: "Dinner",    title: "Salmon With Greek Yogurt",      estimatedCalories: 500, estimatedProtein:  50 },
    { mealId: 16, dailyMealPlanId: 4, mealType: "Snack",     title: "Greek Yogurt And Oats",         estimatedCalories: 270, estimatedProtein:  23 },
    // Plan 5 — Maintenance ~2200 kcal, balanced macros
    { mealId: 17, dailyMealPlanId: 5, mealType: "Breakfast", title: "Oats With Egg And Avocado",     estimatedCalories: 500, estimatedProtein:  30 },
    { mealId: 18, dailyMealPlanId: 5, mealType: "Lunch",     title: "Chicken Rice Bowl With Avocado",estimatedCalories: 700, estimatedProtein:  65 },
    { mealId: 19, dailyMealPlanId: 5, mealType: "Dinner",    title: "Salmon With Sweet Potato",      estimatedCalories: 700, estimatedProtein:  42 },
    { mealId: 20, dailyMealPlanId: 5, mealType: "Snack",     title: "Cottage Cheese And Oats",       estimatedCalories: 300, estimatedProtein:  25 },
    // Plan 6 — Maintenance ~2500 kcal, active user
    { mealId: 21, dailyMealPlanId: 6, mealType: "Breakfast", title: "Oats Greek Yogurt And Egg",     estimatedCalories: 600, estimatedProtein:  35 },
    { mealId: 22, dailyMealPlanId: 6, mealType: "Lunch",     title: "Chicken Rice Bowl With Avocado",estimatedCalories: 800, estimatedProtein:  65 },
    { mealId: 23, dailyMealPlanId: 6, mealType: "Dinner",    title: "Salmon With Rice And Broccoli", estimatedCalories: 750, estimatedProtein:  55 },
    { mealId: 24, dailyMealPlanId: 6, mealType: "Snack",     title: "Cottage Cheese With Oats",      estimatedCalories: 350, estimatedProtein:  28 }
];

// --- meal_food_items ---
let mealFoodItems = [
    { id: 1,  mealId: 1, foodItemId: 2,  foodName: "Greek Yogurt",   quantityGrams: 250 },
    { id: 2,  mealId: 1, foodItemId: 6,  foodName: "Oats",           quantityGrams:  60 },
    { id: 3,  mealId: 2, foodItemId: 1,  foodName: "Chicken Breast", quantityGrams: 180 },
    { id: 4,  mealId: 2, foodItemId: 3,  foodName: "White Rice",     quantityGrams: 250 },
    { id: 5,  mealId: 3, foodItemId: 4,  foodName: "Salmon",         quantityGrams: 180 },
    { id: 6,  mealId: 3, foodItemId: 8,  foodName: "Sweet Potato",   quantityGrams: 250 },
    { id: 7,  mealId: 4, foodItemId: 9,  foodName: "Cottage Cheese", quantityGrams: 200 },
    { id: 8,  mealId: 4, foodItemId: 5,  foodName: "Egg",            quantityGrams:  50 },
    { id: 9,  mealId: 5, foodItemId: 2,  foodName: "Greek Yogurt",   quantityGrams: 220 },
    { id: 10, mealId: 5, foodItemId: 6,  foodName: "Oats",           quantityGrams:  45 },
    { id: 11, mealId: 6, foodItemId: 1,  foodName: "Chicken Breast", quantityGrams: 150 },
    { id: 12, mealId: 6, foodItemId: 3,  foodName: "White Rice",     quantityGrams: 220 },
    { id: 13, mealId: 6, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 150 },
    { id: 14, mealId: 7, foodItemId: 5,  foodName: "Egg",            quantityGrams: 100 },
    { id: 15, mealId: 7, foodItemId: 8,  foodName: "Sweet Potato",   quantityGrams: 250 },
    { id: 16, mealId: 7, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 150 },
    { id: 17, mealId:  8, foodItemId:  9, foodName: "Cottage Cheese", quantityGrams: 200 },
    // Plan 3 meals
    { id: 18, mealId:  9, foodItemId:  6, foodName: "Oats",           quantityGrams:  80 },
    { id: 19, mealId:  9, foodItemId:  2, foodName: "Greek Yogurt",   quantityGrams: 150 },
    { id: 20, mealId: 10, foodItemId:  1, foodName: "Chicken Breast", quantityGrams: 200 },
    { id: 21, mealId: 10, foodItemId:  3, foodName: "White Rice",     quantityGrams: 150 },
    { id: 22, mealId: 10, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 150 },
    { id: 23, mealId: 11, foodItemId:  4, foodName: "Salmon",         quantityGrams: 180 },
    { id: 24, mealId: 11, foodItemId:  8, foodName: "Sweet Potato",   quantityGrams: 250 },
    { id: 25, mealId: 12, foodItemId:  9, foodName: "Cottage Cheese", quantityGrams: 265 },
    // Plan 4 meals
    { id: 26, mealId: 13, foodItemId:  5, foodName: "Egg",            quantityGrams: 200 },
    { id: 27, mealId: 13, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 150 },
    { id: 28, mealId: 14, foodItemId:  1, foodName: "Chicken Breast", quantityGrams: 180 },
    { id: 29, mealId: 14, foodItemId:  8, foodName: "Sweet Potato",   quantityGrams: 200 },
    { id: 30, mealId: 14, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 100 },
    { id: 31, mealId: 15, foodItemId:  4, foodName: "Salmon",         quantityGrams: 150 },
    { id: 32, mealId: 15, foodItemId:  2, foodName: "Greek Yogurt",   quantityGrams: 200 },
    { id: 33, mealId: 16, foodItemId:  2, foodName: "Greek Yogurt",   quantityGrams: 200 },
    { id: 34, mealId: 16, foodItemId:  6, foodName: "Oats",           quantityGrams:  30 },
    // Plan 5 meals
    { id: 35, mealId: 17, foodItemId:  6, foodName: "Oats",           quantityGrams:  80 },
    { id: 36, mealId: 17, foodItemId:  5, foodName: "Egg",            quantityGrams: 100 },
    { id: 37, mealId: 17, foodItemId:  7, foodName: "Avocado",        quantityGrams:  80 },
    { id: 38, mealId: 18, foodItemId:  1, foodName: "Chicken Breast", quantityGrams: 200 },
    { id: 39, mealId: 18, foodItemId:  3, foodName: "White Rice",     quantityGrams: 250 },
    { id: 40, mealId: 18, foodItemId:  7, foodName: "Avocado",        quantityGrams:  80 },
    { id: 41, mealId: 19, foodItemId:  4, foodName: "Salmon",         quantityGrams: 200 },
    { id: 42, mealId: 19, foodItemId:  8, foodName: "Sweet Potato",   quantityGrams: 300 },
    { id: 43, mealId: 19, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 200 },
    { id: 44, mealId: 20, foodItemId:  9, foodName: "Cottage Cheese", quantityGrams: 200 },
    { id: 45, mealId: 20, foodItemId:  6, foodName: "Oats",           quantityGrams:  20 },
    // Plan 6 meals
    { id: 46, mealId: 21, foodItemId:  6, foodName: "Oats",           quantityGrams: 100 },
    { id: 47, mealId: 21, foodItemId:  2, foodName: "Greek Yogurt",   quantityGrams: 250 },
    { id: 48, mealId: 21, foodItemId:  5, foodName: "Egg",            quantityGrams: 100 },
    { id: 49, mealId: 22, foodItemId:  1, foodName: "Chicken Breast", quantityGrams: 250 },
    { id: 50, mealId: 22, foodItemId:  3, foodName: "White Rice",     quantityGrams: 280 },
    { id: 51, mealId: 22, foodItemId:  7, foodName: "Avocado",        quantityGrams: 100 },
    { id: 52, mealId: 23, foodItemId:  4, foodName: "Salmon",         quantityGrams: 200 },
    { id: 53, mealId: 23, foodItemId:  3, foodName: "White Rice",     quantityGrams: 200 },
    { id: 54, mealId: 23, foodItemId: 10, foodName: "Broccoli",       quantityGrams: 200 },
    { id: 55, mealId: 24, foodItemId:  9, foodName: "Cottage Cheese", quantityGrams: 250 },
    { id: 56, mealId: 24, foodItemId:  6, foodName: "Oats",           quantityGrams:  30 }
];

// --- assembly ---
function assemblePlan(plan) {
    const planMeals = meals
        .filter(m => m.dailyMealPlanId === plan.dailyMealPlanId)
        .map(m => ({
            ...m,
            foodItems: mealFoodItems.filter(fi => fi.mealId === m.mealId)
        }));
    return { ...plan, meals: planMeals };
}

// --- plan-level functions ---
const getAll = () => dailyMealPlans.map(assemblePlan);

const getById = (id) => {
    const plan = dailyMealPlans.find(p => p.dailyMealPlanId === id);
    return plan ? assemblePlan(plan) : null;
};

const getByUserId = (userId) =>
    dailyMealPlans.filter(p => p.userId === userId && p.isActive === true).map(assemblePlan);

const deactivateByUserId = (userId) => {
    dailyMealPlans
        .filter(p => p.userId === userId)
        .forEach(p => { p.isActive = false; });
};

const create = (data) => {
    const newPlan = {
        dailyMealPlanId: dailyMealPlans.length > 0 ? dailyMealPlans[dailyMealPlans.length - 1].dailyMealPlanId + 1 : 1,
        userId: data.userId,
        name: data.name,
        goal: data.goal,
        targetCalories: data.targetCalories,
        targetProtein: data.targetProtein,
        isActive: data.isActive,
        createdAt: new Date().toISOString().split("T")[0]
    };
    dailyMealPlans.push(newPlan);
    return assemblePlan(newPlan);
};

const update = (id, data) => {
    const index = dailyMealPlans.findIndex(p => p.dailyMealPlanId === id);
    if (index === -1) return null;
    dailyMealPlans[index] = {
        ...dailyMealPlans[index],
        name: data.name,
        goal: data.goal,
        targetCalories: data.targetCalories,
        targetProtein: data.targetProtein,
        isActive: data.isActive
    };
    return assemblePlan(dailyMealPlans[index]);
};

const remove = (id) => {
    const index = dailyMealPlans.findIndex(p => p.dailyMealPlanId === id);
    if (index === -1) return null;
    const mealIds = meals.filter(m => m.dailyMealPlanId === id).map(m => m.mealId);
    mealFoodItems = mealFoodItems.filter(fi => !mealIds.includes(fi.mealId));
    meals = meals.filter(m => m.dailyMealPlanId !== id);
    return dailyMealPlans.splice(index, 1)[0];
};

// --- meal-level functions ---
const getMeals = (planId) => meals.filter(m => m.dailyMealPlanId === planId);

const getMealById = (mealId) => meals.find(m => m.mealId === mealId) || null;

const createMeal = (data) => {
    const newMeal = {
        mealId: meals.length > 0 ? meals[meals.length - 1].mealId + 1 : 1,
        dailyMealPlanId: data.dailyMealPlanId,
        mealType: data.mealType,
        title: data.title,
        estimatedCalories: data.estimatedCalories,
        estimatedProtein: data.estimatedProtein
    };
    meals.push(newMeal);
    return newMeal;
};

const updateMeal = (mealId, data) => {
    const index = meals.findIndex(m => m.mealId === mealId);
    if (index === -1) return null;
    meals[index] = { ...meals[index], ...data };
    return meals[index];
};

const removeMeal = (mealId) => {
    const index = meals.findIndex(m => m.mealId === mealId);
    if (index === -1) return null;
    mealFoodItems = mealFoodItems.filter(fi => fi.mealId !== mealId);
    return meals.splice(index, 1)[0];
};

// --- meal-food-item-level functions ---
const getMealFoodItems = (mealId) => mealFoodItems.filter(fi => fi.mealId === mealId);

const getMealFoodItemById = (id) => mealFoodItems.find(fi => fi.id === id) || null;

const createMealFoodItem = (data) => {
    const newItem = {
        id: mealFoodItems.length > 0 ? mealFoodItems[mealFoodItems.length - 1].id + 1 : 1,
        mealId: data.mealId,
        foodItemId: data.foodItemId,
        foodName: data.foodName,
        quantityGrams: data.quantityGrams
    };
    mealFoodItems.push(newItem);
    return newItem;
};

const updateMealFoodItem = (id, data) => {
    const index = mealFoodItems.findIndex(fi => fi.id === id);
    if (index === -1) return null;
    mealFoodItems[index] = { ...mealFoodItems[index], ...data };
    return mealFoodItems[index];
};

const removeMealFoodItem = (id) => {
    const index = mealFoodItems.findIndex(fi => fi.id === id);
    if (index === -1) return null;
    return mealFoodItems.splice(index, 1)[0];
};

module.exports = {
    getAll, getById, getByUserId, deactivateByUserId, create, update, remove,
    getMeals, getMealById, createMeal, updateMeal, removeMeal,
    getMealFoodItems, getMealFoodItemById, createMealFoodItem, updateMealFoodItem, removeMealFoodItem
};

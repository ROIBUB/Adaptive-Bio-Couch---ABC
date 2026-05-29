// --- daily_meal_plans ---
let dailyMealPlans = [
    { dailyMealPlanId: 1, userId: 1, name: "John Doe - Muscle Gain Daily Meal Plan",  goal: "muscle gain", targetCalories: 2800, targetProtein: 150, isActive: true, createdAt: "2026-05-05" },
    { dailyMealPlanId: 2, userId: 3, name: "Dana Cohen - Muscle Gain Daily Meal Plan", goal: "muscle gain", targetCalories: 2300, targetProtein: 120, isActive: true, createdAt: "2026-05-05" }
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
    { mealId: 8, dailyMealPlanId: 2, mealType: "Snack",     title: "Cottage Cheese Snack",     estimatedCalories: 300, estimatedProtein: 25 }
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
    { id: 17, mealId: 8, foodItemId: 9,  foodName: "Cottage Cheese", quantityGrams: 200 }
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
    dailyMealPlans.filter(p => p.userId === userId).map(assemblePlan);

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
    getAll, getById, getByUserId, create, update, remove,
    getMeals, getMealById, createMeal, updateMeal, removeMeal,
    getMealFoodItems, getMealFoodItemById, createMealFoodItem, updateMealFoodItem, removeMealFoodItem
};

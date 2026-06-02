const DailyMealPlansModel = require('../models/dailyMealPlans.model');

const { sendSuccess, sendValidationError, sendNotFound, sendServerError } = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/daily-meal-plans
const getAllDailyMealPlans = (req, res) => {
    try {
        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (isAdminRole(userRole)) {
            return sendSuccess(res, 200, DailyMealPlansModel.getAll());
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        return sendSuccess(res, 200, DailyMealPlansModel.getByUserId(requestUserId));
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/daily-meal-plans/:id
const getDailyMealPlanById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid daily meal plan id', { field: 'id', value: req.params.id });
        }

        const plan = DailyMealPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Daily meal plan not found', { dailyMealPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Daily meal plan not found', { dailyMealPlanId: id });
        }

        return sendSuccess(res, 200, plan);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/daily-meal-plans
const createDailyMealPlan = (req, res) => {
    try {
        const userId = parseInt(req.headers['userid']);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'Missing user id', { field: 'userid header' });
        }

        const { name, goal, targetCalories, targetProtein, isActive, meals } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'goal', 'targetCalories', 'targetProtein', 'isActive', 'meals']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required daily meal plan fields', { missingFields });
        }

        if (typeof targetCalories !== 'number' || targetCalories <= 0) {
            return sendValidationError(res, 'Invalid target calories', { field: 'targetCalories', value: targetCalories });
        }

        if (typeof targetProtein !== 'number' || targetProtein <= 0) {
            return sendValidationError(res, 'Invalid target protein', { field: 'targetProtein', value: targetProtein });
        }

        if (typeof isActive !== 'boolean') {
            return sendValidationError(res, 'Invalid isActive value', { field: 'isActive', value: isActive });
        }

        if (!Array.isArray(meals) || meals.length === 0) {
            return sendValidationError(res, 'Meals must be a non-empty array', { field: 'meals' });
        }

        const invalidMeals = [];
        meals.forEach((meal, mealIndex) => {
            if (!meal.mealType) invalidMeals.push({ mealIndex, field: 'mealType' });
            if (!meal.title) invalidMeals.push({ mealIndex, field: 'title' });
            if (typeof meal.estimatedCalories !== 'number' || meal.estimatedCalories <= 0) {
                invalidMeals.push({ mealIndex, field: 'estimatedCalories', value: meal.estimatedCalories });
            }
            if (typeof meal.estimatedProtein !== 'number' || meal.estimatedProtein < 0) {
                invalidMeals.push({ mealIndex, field: 'estimatedProtein', value: meal.estimatedProtein });
            }
            if (!Array.isArray(meal.foodItems) || meal.foodItems.length === 0) {
                invalidMeals.push({ mealIndex, field: 'foodItems' });
            }
        });

        if (invalidMeals.length > 0) {
            return sendValidationError(res, 'Invalid meals structure', { invalidMeals });
        }

        const invalidFoodItems = [];
        meals.forEach((meal, mealIndex) => {
            if (Array.isArray(meal.foodItems)) {
                meal.foodItems.forEach((foodItem, foodItemIndex) => {
                    if (typeof foodItem.foodItemId !== 'number' || foodItem.foodItemId <= 0) {
                        invalidFoodItems.push({ mealIndex, foodItemIndex, field: 'foodItemId', value: foodItem.foodItemId });
                    }
                    if (!foodItem.foodName) {
                        invalidFoodItems.push({ mealIndex, foodItemIndex, field: 'foodName' });
                    }
                    if (typeof foodItem.quantityGrams !== 'number' || foodItem.quantityGrams <= 0) {
                        invalidFoodItems.push({ mealIndex, foodItemIndex, field: 'quantityGrams', value: foodItem.quantityGrams });
                    }
                });
            }
        });

        if (invalidFoodItems.length > 0) {
            return sendValidationError(res, 'Invalid food items in daily meal plan', { invalidFoodItems });
        }

        const newPlan = DailyMealPlansModel.create({ userId, name, goal, targetCalories, targetProtein, isActive });

        meals.forEach(meal => {
            const newMeal = DailyMealPlansModel.createMeal({
                dailyMealPlanId: newPlan.dailyMealPlanId,
                mealType: meal.mealType,
                title: meal.title,
                estimatedCalories: meal.estimatedCalories,
                estimatedProtein: meal.estimatedProtein
            });
            meal.foodItems.forEach(fi => {
                DailyMealPlansModel.createMealFoodItem({
                    mealId: newMeal.mealId,
                    foodItemId: fi.foodItemId,
                    foodName: fi.foodName,
                    quantityGrams: fi.quantityGrams
                });
            });
        });

        return sendSuccess(res, 201, DailyMealPlansModel.getById(newPlan.dailyMealPlanId));
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/daily-meal-plans/:id
const updateDailyMealPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid daily meal plan id', { field: 'id', value: req.params.id });
        }

        const plan = DailyMealPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Daily meal plan not found', { dailyMealPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Daily meal plan not found', { dailyMealPlanId: id });
        }

        const { name, goal, targetCalories, targetProtein, isActive, meals } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'goal', 'targetCalories', 'targetProtein', 'isActive', 'meals']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required daily meal plan fields', { missingFields });
        }

        if (typeof targetCalories !== 'number' || targetCalories <= 0) {
            return sendValidationError(res, 'Invalid target calories', { field: 'targetCalories', value: targetCalories });
        }

        if (typeof targetProtein !== 'number' || targetProtein <= 0) {
            return sendValidationError(res, 'Invalid target protein', { field: 'targetProtein', value: targetProtein });
        }

        if (typeof isActive !== 'boolean') {
            return sendValidationError(res, 'Invalid isActive value', { field: 'isActive', value: isActive });
        }

        if (!Array.isArray(meals) || meals.length === 0) {
            return sendValidationError(res, 'Meals must be a non-empty array', { field: 'meals' });
        }

        const invalidMeals = [];
        meals.forEach((meal, mealIndex) => {
            if (!meal.mealType) invalidMeals.push({ mealIndex, field: 'mealType' });
            if (!meal.title) invalidMeals.push({ mealIndex, field: 'title' });
            if (typeof meal.estimatedCalories !== 'number' || meal.estimatedCalories <= 0) {
                invalidMeals.push({ mealIndex, field: 'estimatedCalories', value: meal.estimatedCalories });
            }
            if (typeof meal.estimatedProtein !== 'number' || meal.estimatedProtein < 0) {
                invalidMeals.push({ mealIndex, field: 'estimatedProtein', value: meal.estimatedProtein });
            }
            if (!Array.isArray(meal.foodItems) || meal.foodItems.length === 0) {
                invalidMeals.push({ mealIndex, field: 'foodItems' });
            }
        });

        if (invalidMeals.length > 0) {
            return sendValidationError(res, 'Invalid meals structure', { invalidMeals });
        }

        const invalidFoodItems = [];
        meals.forEach((meal, mealIndex) => {
            if (Array.isArray(meal.foodItems)) {
                meal.foodItems.forEach((foodItem, foodItemIndex) => {
                    if (typeof foodItem.foodItemId !== 'number' || foodItem.foodItemId <= 0) {
                        invalidFoodItems.push({ mealIndex, foodItemIndex, field: 'foodItemId', value: foodItem.foodItemId });
                    }
                    if (!foodItem.foodName) {
                        invalidFoodItems.push({ mealIndex, foodItemIndex, field: 'foodName' });
                    }
                    if (typeof foodItem.quantityGrams !== 'number' || foodItem.quantityGrams <= 0) {
                        invalidFoodItems.push({ mealIndex, foodItemIndex, field: 'quantityGrams', value: foodItem.quantityGrams });
                    }
                });
            }
        });

        if (invalidFoodItems.length > 0) {
            return sendValidationError(res, 'Invalid food items in daily meal plan', { invalidFoodItems });
        }

        DailyMealPlansModel.getMeals(id).forEach(m => DailyMealPlansModel.removeMeal(m.mealId));

        DailyMealPlansModel.update(id, { name, goal, targetCalories, targetProtein, isActive });

        meals.forEach(meal => {
            const newMeal = DailyMealPlansModel.createMeal({
                dailyMealPlanId: id,
                mealType: meal.mealType,
                title: meal.title,
                estimatedCalories: meal.estimatedCalories,
                estimatedProtein: meal.estimatedProtein
            });
            meal.foodItems.forEach(fi => {
                DailyMealPlansModel.createMealFoodItem({
                    mealId: newMeal.mealId,
                    foodItemId: fi.foodItemId,
                    foodName: fi.foodName,
                    quantityGrams: fi.quantityGrams
                });
            });
        });

        return sendSuccess(res, 200, DailyMealPlansModel.getById(id));
    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/daily-meal-plans/:id
const deleteDailyMealPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid daily meal plan id', { field: 'id', value: req.params.id });
        }

        const plan = DailyMealPlansModel.getById(id);

        if (!plan) {
            return sendNotFound(res, 'Daily meal plan not found', { dailyMealPlanId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['userid']);

        if (!isAdminRole(userRole) && plan.userId !== requestUserId) {
            return sendNotFound(res, 'Daily meal plan not found', { dailyMealPlanId: id });
        }

        const deleted = DailyMealPlansModel.remove(id);
        return sendSuccess(res, 200, { dailyMealPlanId: deleted.dailyMealPlanId });
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllDailyMealPlans, getDailyMealPlanById, createDailyMealPlan, updateDailyMealPlan, deleteDailyMealPlan };

const dailyMealPlans = require("../models/dailyMealPlans.model");

const {sendSuccess, sendValidationError, sendNotFound, sendServerError} = require("../middleware/errorHandlers");

const {validateId, getMissingFields} = require("../middleware/validation");

// GET /api/daily-meal-plans
const getAllDailyMealPlans = (req, res) => {
    try {
        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole === "admin") {
            return sendSuccess(res, 200, dailyMealPlans);
        }

        if (!validateId(requestUserId)) {
            return sendValidationError(
                res,
                "Missing or invalid user id in request headers",
                {
                    field: "userid",
                    value: req.headers.userid || null
                }
            );
        }

        const userMealPlans = dailyMealPlans.filter(
            plan => plan.userId === requestUserId
        );

        return sendSuccess(res, 200, userMealPlans);

    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/daily-meal-plans/:id
const getDailyMealPlanById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid daily meal plan id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const dailyMealPlan = dailyMealPlans.find(plan => plan.dailyMealPlanId === id);

        if (!dailyMealPlan) {
            return sendNotFound(
                res,
                "Daily meal plan not found",
                {
                    dailyMealPlanId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = Number(req.headers.userid);

        if (userRole !== "admin" && dailyMealPlan.userId !== requestUserId) {
            return sendNotFound(res, "Daily meal plan not found", { dailyMealPlanId: id });
        }

        return sendSuccess(res, 200, dailyMealPlan);

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/daily-meal-plans
const createDailyMealPlan = (req, res) => {
    try {
        const userId = parseInt(req.headers["userid"]);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, "Missing user id", { field: "userid header" });
        }

        const {name, goal, targetCalories, targetProtein, isActive, meals} = req.body;

        const requiredFields = ["name", "goal", "targetCalories", "targetProtein", "isActive", "meals"];

        const missingFields = getMissingFields(
            req.body,
            requiredFields
        );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required daily meal plan fields",
                {
                    missingFields: missingFields
                }
            );
        }

        if (
            typeof targetCalories !== "number" ||
            targetCalories <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid target calories",
                {
                    field: "targetCalories",
                    value: targetCalories
                }
            );
        }

        if (
            typeof targetProtein !== "number" ||
            targetProtein <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid target protein",
                {
                    field: "targetProtein",
                    value: targetProtein
                }
            );
        }

        if (typeof isActive !== "boolean") {
            return sendValidationError(
                res,
                "Invalid isActive value",
                {
                    field: "isActive",
                    value: isActive
                }
            );
        }

        if (!Array.isArray(meals) || meals.length === 0) {
            return sendValidationError(
                res,
                "Meals must be a non-empty array",
                {
                    field: "meals"
                }
            );
        }

        const invalidMeals = [];

        meals.forEach((meal, mealIndex) => {
            if (!meal.mealType) {
                invalidMeals.push({
                    mealIndex,
                    field: "mealType"
                });
            }

            if (!meal.title) {
                invalidMeals.push({
                    mealIndex,
                    field: "title"
                });
            }

            if (
                typeof meal.estimatedCalories !== "number" ||
                meal.estimatedCalories <= 0
            ) {
                invalidMeals.push({
                    mealIndex,
                    field: "estimatedCalories",
                    value: meal.estimatedCalories
                });
            }

            if (
                typeof meal.estimatedProtein !== "number" ||
                meal.estimatedProtein < 0
            ) {
                invalidMeals.push({
                    mealIndex,
                    field: "estimatedProtein",
                    value: meal.estimatedProtein
                });
            }

            if (
                !Array.isArray(meal.foodItems) ||
                meal.foodItems.length === 0
            ) {
                invalidMeals.push({
                    mealIndex,
                    field: "foodItems"
                });
            }
        });

        if (invalidMeals.length > 0) {
            return sendValidationError(
                res,
                "Invalid meals structure",
                {
                    invalidMeals: invalidMeals
                }
            );
        }

        const invalidFoodItems = [];

        meals.forEach((meal, mealIndex) => {
            if (Array.isArray(meal.foodItems)) {

                meal.foodItems.forEach(
                    (foodItem, foodItemIndex) => {

                        if (
                            typeof foodItem.foodItemId !== "number" ||
                            foodItem.foodItemId <= 0
                        ) {
                            invalidFoodItems.push({
                                mealIndex,
                                foodItemIndex,
                                field: "foodItemId",
                                value: foodItem.foodItemId
                            });
                        }

                        if (!foodItem.foodName) {
                            invalidFoodItems.push({
                                mealIndex,
                                foodItemIndex,
                                field: "foodName"
                            });
                        }

                        if (
                            typeof foodItem.quantityGrams !== "number" ||
                            foodItem.quantityGrams <= 0
                        ) {
                            invalidFoodItems.push({
                                mealIndex,
                                foodItemIndex,
                                field: "quantityGrams",
                                value: foodItem.quantityGrams
                            });
                        }
                    }
                );
            }
        });

        if (invalidFoodItems.length > 0) {
            return sendValidationError(
                res,
                "Invalid food items in daily meal plan",
                {
                    invalidFoodItems: invalidFoodItems
                }
            );
        }

        const newDailyMealPlan = {
            dailyMealPlanId: dailyMealPlans.length > 0
                    ? dailyMealPlans[dailyMealPlans.length - 1].dailyMealPlanId + 1
                    : 1,
            userId,
            name,
            goal,
            targetCalories,
            targetProtein,
            isActive,
            meals,
            createdAt: new Date()
                .toISOString()
                .split("T")[0]
        };

        dailyMealPlans.push(newDailyMealPlan);

        return sendSuccess(
            res,
            201,
            newDailyMealPlan
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/daily-meal-plans/:id
const updateDailyMealPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid daily meal plan id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const dailyMealPlanIndex =
            dailyMealPlans.findIndex(
                plan => plan.dailyMealPlanId === id
            );

        if (dailyMealPlanIndex === -1) {
            return sendNotFound(
                res,
                "Daily meal plan not found",
                {
                    dailyMealPlanId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = parseInt(req.headers["userid"]);

        if (userRole !== "admin" && dailyMealPlans[dailyMealPlanIndex].userId !== requestUserId) {
            return sendNotFound(res, "Daily meal plan not found", { dailyMealPlanId: id });
        }

        const {
            name,
            goal,
            targetCalories,
            targetProtein,
            isActive,
            meals
        } = req.body;

        const requiredFields = [
            "name",
            "goal",
            "targetCalories",
            "targetProtein",
            "isActive",
            "meals"
        ];

        const missingFields = getMissingFields(
            req.body,
            requiredFields
        );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required daily meal plan fields",
                {
                    missingFields: missingFields
                }
            );
        }

        if (
            typeof targetCalories !== "number" ||
            targetCalories <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid target calories",
                {
                    field: "targetCalories",
                    value: targetCalories
                }
            );
        }

        if (
            typeof targetProtein !== "number" ||
            targetProtein <= 0
        ) {
            return sendValidationError(
                res,
                "Invalid target protein",
                {
                    field: "targetProtein",
                    value: targetProtein
                }
            );
        }

        if (typeof isActive !== "boolean") {
            return sendValidationError(
                res,
                "Invalid isActive value",
                {
                    field: "isActive",
                    value: isActive
                }
            );
        }

        if (!Array.isArray(meals) || meals.length === 0) {
            return sendValidationError(
                res,
                "Meals must be a non-empty array",
                {
                    field: "meals"
                }
            );
        }

        const invalidMeals = [];

        meals.forEach((meal, mealIndex) => {
            if (!meal.mealType) {
                invalidMeals.push({
                    mealIndex,
                    field: "mealType"
                });
            }

            if (!meal.title) {
                invalidMeals.push({
                    mealIndex,
                    field: "title"
                });
            }

            if (
                typeof meal.estimatedCalories !== "number" ||
                meal.estimatedCalories <= 0
            ) {
                invalidMeals.push({
                    mealIndex,
                    field: "estimatedCalories",
                    value: meal.estimatedCalories
                });
            }

            if (
                typeof meal.estimatedProtein !== "number" ||
                meal.estimatedProtein < 0
            ) {
                invalidMeals.push({
                    mealIndex,
                    field: "estimatedProtein",
                    value: meal.estimatedProtein
                });
            }

            if (
                !Array.isArray(meal.foodItems) ||
                meal.foodItems.length === 0
            ) {
                invalidMeals.push({
                    mealIndex,
                    field: "foodItems"
                });
            }
        });

        if (invalidMeals.length > 0) {
            return sendValidationError(
                res,
                "Invalid meals structure",
                {
                    invalidMeals: invalidMeals
                }
            );
        }

        const invalidFoodItems = [];

        meals.forEach((meal, mealIndex) => {
            if (Array.isArray(meal.foodItems)) {

                meal.foodItems.forEach(
                    (foodItem, foodItemIndex) => {

                        if (
                            typeof foodItem.foodItemId !== "number" ||
                            foodItem.foodItemId <= 0
                        ) {
                            invalidFoodItems.push({
                                mealIndex,
                                foodItemIndex,
                                field: "foodItemId",
                                value: foodItem.foodItemId
                            });
                        }

                        if (!foodItem.foodName) {
                            invalidFoodItems.push({
                                mealIndex,
                                foodItemIndex,
                                field: "foodName"
                            });
                        }

                        if (
                            typeof foodItem.quantityGrams !== "number" ||
                            foodItem.quantityGrams <= 0
                        ) {
                            invalidFoodItems.push({
                                mealIndex,
                                foodItemIndex,
                                field: "quantityGrams",
                                value: foodItem.quantityGrams
                            });
                        }
                    }
                );
            }
        });

        if (invalidFoodItems.length > 0) {
            return sendValidationError(
                res,
                "Invalid food items in daily meal plan",
                {
                    invalidFoodItems: invalidFoodItems
                }
            );
        }

        dailyMealPlans[dailyMealPlanIndex] = {
            dailyMealPlanId: id,
            userId: dailyMealPlans[dailyMealPlanIndex].userId,
            name,
            goal,
            targetCalories,
            targetProtein,
            isActive,
            meals,
            createdAt:
            dailyMealPlans[dailyMealPlanIndex].createdAt
        };

        return sendSuccess(
            res,
            200,
            dailyMealPlans[dailyMealPlanIndex]
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/daily-meal-plans/:id
const deleteDailyMealPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid daily meal plan id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const dailyMealPlanIndex =
            dailyMealPlans.findIndex(
                plan => plan.dailyMealPlanId === id
            );

        if (dailyMealPlanIndex === -1) {
            return sendNotFound(
                res,
                "Daily meal plan not found",
                {
                    dailyMealPlanId: id
                }
            );
        }

        const userRole = req.headers["x-user-role"];
        const requestUserId = parseInt(req.headers["userid"]);

        if (userRole !== "admin" && dailyMealPlans[dailyMealPlanIndex].userId !== requestUserId) {
            return sendNotFound(res, "Daily meal plan not found", { dailyMealPlanId: id });
        }

        const deletedDailyMealPlan =
            dailyMealPlans.splice(
                dailyMealPlanIndex,
                1
            )[0];

        return sendSuccess(
            res,
            200,
            {
                dailyMealPlanId:
                deletedDailyMealPlan.dailyMealPlanId
            }
        );

    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = {
    getAllDailyMealPlans,
    getDailyMealPlanById,
    createDailyMealPlan,
    updateDailyMealPlan,
    deleteDailyMealPlan
};
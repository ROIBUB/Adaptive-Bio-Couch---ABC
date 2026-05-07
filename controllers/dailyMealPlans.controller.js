const dailyMealPlans = require("../models/dailyMealPlans.model");

// GET /api/daily-meal-plans
const getAllDailyMealPlans = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: dailyMealPlans,
            error: null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// GET /api/daily-meal-plans/:id
const getDailyMealPlanById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid daily meal plan id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const dailyMealPlan = dailyMealPlans.find(plan => plan.dailyMealPlanId === id);

        if (!dailyMealPlan) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Daily meal plan not found",
                    details: {
                        dailyMealPlanId: id
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: dailyMealPlan,
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// POST /api/daily-meal-plans
const createDailyMealPlan = (req, res) => {
    try {
        const {
            userId,
            name,
            goal,
            targetCalories,
            targetProtein,
            isActive,
            meals
        } = req.body;

        const requiredFields = [
            "userId",
            "name",
            "goal",
            "targetCalories",
            "targetProtein",
            "isActive",
            "meals"
        ];

        const missingFields = requiredFields.filter(field =>
            req.body[field] === undefined || req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required daily meal plan fields",
                    details: {
                        missingFields: missingFields
                    }
                }
            });
        }

        if (typeof userId !== "number" || userId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid user id",
                    details: {
                        field: "userId",
                        value: userId
                    }
                }
            });
        }

        if (typeof targetCalories !== "number" || targetCalories <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid target calories",
                    details: {
                        field: "targetCalories",
                        value: targetCalories
                    }
                }
            });
        }

        if (typeof targetProtein !== "number" || targetProtein <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid target protein",
                    details: {
                        field: "targetProtein",
                        value: targetProtein
                    }
                }
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid isActive value",
                    details: {
                        field: "isActive",
                        value: isActive
                    }
                }
            });
        }

        if (!Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Meals must be a non-empty array",
                    details: {
                        field: "meals"
                    }
                }
            });
        }

        const invalidMeals = [];

        meals.forEach((meal, mealIndex) => {
            if (!meal.mealType) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "mealType"
                });
            }

            if (!meal.title) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "title"
                });
            }

            if (typeof meal.estimatedCalories !== "number" || meal.estimatedCalories <= 0) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "estimatedCalories",
                    value: meal.estimatedCalories
                });
            }

            if (typeof meal.estimatedProtein !== "number" || meal.estimatedProtein < 0) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "estimatedProtein",
                    value: meal.estimatedProtein
                });
            }

            if (!Array.isArray(meal.foodItems) || meal.foodItems.length === 0) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "foodItems"
                });
            }
        });

        if (invalidMeals.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid meals structure",
                    details: {
                        invalidMeals: invalidMeals
                    }
                }
            });
        }

        const invalidFoodItems = [];

        meals.forEach((meal, mealIndex) => {
            if (Array.isArray(meal.foodItems)) {
                meal.foodItems.forEach((foodItem, foodItemIndex) => {
                    if (typeof foodItem.foodItemId !== "number" || foodItem.foodItemId <= 0) {
                        invalidFoodItems.push({
                            mealIndex: mealIndex,
                            foodItemIndex: foodItemIndex,
                            field: "foodItemId",
                            value: foodItem.foodItemId
                        });
                    }

                    if (!foodItem.foodName) {
                        invalidFoodItems.push({
                            mealIndex: mealIndex,
                            foodItemIndex: foodItemIndex,
                            field: "foodName"
                        });
                    }

                    if (typeof foodItem.quantityGrams !== "number" || foodItem.quantityGrams <= 0) {
                        invalidFoodItems.push({
                            mealIndex: mealIndex,
                            foodItemIndex: foodItemIndex,
                            field: "quantityGrams",
                            value: foodItem.quantityGrams
                        });
                    }
                });
            }
        });

        if (invalidFoodItems.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid food items in daily meal plan",
                    details: {
                        invalidFoodItems: invalidFoodItems
                    }
                }
            });
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
            createdAt: new Date().toISOString().split("T")[0]
        };

        dailyMealPlans.push(newDailyMealPlan);

        res.status(201).json({
            success: true,
            data: newDailyMealPlan,
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// PUT /api/daily-meal-plans/:id
const updateDailyMealPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid daily meal plan id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const dailyMealPlanIndex = dailyMealPlans.findIndex(plan => plan.dailyMealPlanId === id);

        if (dailyMealPlanIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Daily meal plan not found",
                    details: {
                        dailyMealPlanId: id
                    }
                }
            });
        }

        const {
            userId,
            name,
            goal,
            targetCalories,
            targetProtein,
            isActive,
            meals
        } = req.body;

        const requiredFields = [
            "userId",
            "name",
            "goal",
            "targetCalories",
            "targetProtein",
            "isActive",
            "meals"
        ];

        const missingFields = requiredFields.filter(field =>
            req.body[field] === undefined || req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required daily meal plan fields",
                    details: {
                        missingFields: missingFields
                    }
                }
            });
        }

        if (typeof userId !== "number" || userId <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid user id",
                    details: {
                        field: "userId",
                        value: userId
                    }
                }
            });
        }

        if (typeof targetCalories !== "number" || targetCalories <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid target calories",
                    details: {
                        field: "targetCalories",
                        value: targetCalories
                    }
                }
            });
        }

        if (typeof targetProtein !== "number" || targetProtein <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid target protein",
                    details: {
                        field: "targetProtein",
                        value: targetProtein
                    }
                }
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid isActive value",
                    details: {
                        field: "isActive",
                        value: isActive
                    }
                }
            });
        }

        if (!Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Meals must be a non-empty array",
                    details: {
                        field: "meals"
                    }
                }
            });
        }

        const invalidMeals = [];

        meals.forEach((meal, mealIndex) => {
            if (!meal.mealType) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "mealType"
                });
            }

            if (!meal.title) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "title"
                });
            }

            if (typeof meal.estimatedCalories !== "number" || meal.estimatedCalories <= 0) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "estimatedCalories",
                    value: meal.estimatedCalories
                });
            }

            if (typeof meal.estimatedProtein !== "number" || meal.estimatedProtein < 0) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "estimatedProtein",
                    value: meal.estimatedProtein
                });
            }

            if (!Array.isArray(meal.foodItems) || meal.foodItems.length === 0) {
                invalidMeals.push({
                    mealIndex: mealIndex,
                    field: "foodItems"
                });
            }
        });

        if (invalidMeals.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid meals structure",
                    details: {
                        invalidMeals: invalidMeals
                    }
                }
            });
        }

        const invalidFoodItems = [];

        meals.forEach((meal, mealIndex) => {
            if (Array.isArray(meal.foodItems)) {
                meal.foodItems.forEach((foodItem, foodItemIndex) => {
                    if (typeof foodItem.foodItemId !== "number" || foodItem.foodItemId <= 0) {
                        invalidFoodItems.push({
                            mealIndex: mealIndex,
                            foodItemIndex: foodItemIndex,
                            field: "foodItemId",
                            value: foodItem.foodItemId
                        });
                    }

                    if (!foodItem.foodName) {
                        invalidFoodItems.push({
                            mealIndex: mealIndex,
                            foodItemIndex: foodItemIndex,
                            field: "foodName"
                        });
                    }

                    if (typeof foodItem.quantityGrams !== "number" || foodItem.quantityGrams <= 0) {
                        invalidFoodItems.push({
                            mealIndex: mealIndex,
                            foodItemIndex: foodItemIndex,
                            field: "quantityGrams",
                            value: foodItem.quantityGrams
                        });
                    }
                });
            }
        });

        if (invalidFoodItems.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid food items in daily meal plan",
                    details: {
                        invalidFoodItems: invalidFoodItems
                    }
                }
            });
        }

        dailyMealPlans[dailyMealPlanIndex] = {
            dailyMealPlanId: id,
            userId,
            name,
            goal,
            targetCalories,
            targetProtein,
            isActive,
            meals,
            createdAt: dailyMealPlans[dailyMealPlanIndex].createdAt
        };

        res.status(200).json({
            success: true,
            data: dailyMealPlans[dailyMealPlanIndex],
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

// DELETE /api/daily-meal-plans/:id
const deleteDailyMealPlan = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid daily meal plan id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const dailyMealPlanIndex = dailyMealPlans.findIndex(plan => plan.dailyMealPlanId === id);

        if (dailyMealPlanIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Daily meal plan not found",
                    details: {
                        dailyMealPlanId: id
                    }
                }
            });
        }

        const deletedDailyMealPlan = dailyMealPlans.splice(dailyMealPlanIndex, 1)[0];

        res.status(200).json({
            success: true,
            data: {
                dailyMealPlanId: deletedDailyMealPlan.dailyMealPlanId
            },
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};

module.exports = {
    getAllDailyMealPlans,
    getDailyMealPlanById,
    createDailyMealPlan,
    updateDailyMealPlan,
    deleteDailyMealPlan
};
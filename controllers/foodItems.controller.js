const foodItems = require("../models/foodItems.model");

// GET /api/food-items
const getAllFoodItems = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: foodItems,
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

// GET /api/food-items/:id
const getFoodItemById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid food item id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const foodItem = foodItems.find(item => item.foodItemId === id);

        if (!foodItem) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Food item not found",
                    details: { foodItemId: id }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: foodItem,
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

// POST /api/food-items
const createFoodItem = (req, res) => {
    try {
        const {
            name,
            category,
            caloriesPer100g,
            proteinPer100g,
            carbsPer100g,
            fatPer100g
        } = req.body;

        const requiredFields = [
            "name",
            "category",
            "caloriesPer100g",
            "proteinPer100g",
            "carbsPer100g",
            "fatPer100g"
        ];

        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === "");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required food item fields",
                    details: {
                        missingFields: missingFields
                    }
                }
            });
        }

        const numericFields = [
            "caloriesPer100g",
            "proteinPer100g",
            "carbsPer100g",
            "fatPer100g"
        ];

        const invalidFields = numericFields.filter(field => {
            return typeof req.body[field] !== "number" || req.body[field] < 0;
        });

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid numeric food item fields",
                    details: {
                        invalidFields: invalidFields
                    }
                }
            });
        }

        const newFoodItem = {
            foodItemId: foodItems.length > 0
                ? foodItems[foodItems.length - 1].foodItemId + 1
                : 1,
            name,
            category,
            caloriesPer100g,
            proteinPer100g,
            carbsPer100g,
            fatPer100g
        };

        foodItems.push(newFoodItem);

        res.status(201).json({
            success: true,
            data: newFoodItem,
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

// PUT /api/food-items/:id
const updateFoodItem = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid food item id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const {
            name,
            category,
            caloriesPer100g,
            proteinPer100g,
            carbsPer100g,
            fatPer100g
        } = req.body;

        const requiredFields = [
            "name",
            "category",
            "caloriesPer100g",
            "proteinPer100g",
            "carbsPer100g",
            "fatPer100g"
        ];

        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === "");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required food item fields",
                    details: {
                        missingFields: missingFields
                    }
                }
            });
        }

        const numericFields = [
            "caloriesPer100g",
            "proteinPer100g",
            "carbsPer100g",
            "fatPer100g"
        ];

        const invalidFields = numericFields.filter(field => {
            return typeof req.body[field] !== "number" || req.body[field] < 0;
        });

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid numeric food item fields",
                    details: {
                        invalidFields: invalidFields
                    }
                }
            });
        }

        const foodItemIndex = foodItems.findIndex(item => item.foodItemId === id);

        if (foodItemIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Food item not found",
                    details: { foodItemId: id }
                }
            });
        }

        foodItems[foodItemIndex] = {
            foodItemId: id,
            name,
            category,
            caloriesPer100g,
            proteinPer100g,
            carbsPer100g,
            fatPer100g
        };

        res.status(200).json({
            success: true,
            data: foodItems[foodItemIndex],
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

// DELETE /api/food-items/:id
const deleteFoodItem = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid food item id",
                    details: {
                        field: "id",
                        value: req.params.id
                    }
                }
            });
        }

        const foodItemIndex = foodItems.findIndex(item => item.foodItemId === id);

        if (foodItemIndex === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: "Food item not found",
                    details: { foodItemId: id }
                }
            });
        }

        const deletedFoodItem = foodItems.splice(foodItemIndex, 1)[0];

        res.status(200).json({
            success: true,
            data: {
                foodItemId: deletedFoodItem.foodItemId
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
    getAllFoodItems,
    getFoodItemById,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem
};
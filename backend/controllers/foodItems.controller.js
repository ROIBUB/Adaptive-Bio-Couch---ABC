const FoodItemsModel = require('../models/foodItems.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields, validateNumericFields } = require('../middleware/validation');

// GET /api/food-items
const getAllFoodItems = async (req, res) => {
    try {
        return sendSuccess(res, 200, await FoodItemsModel.getAll());
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/food-items/:id
const getFoodItemById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid food item id', { field: 'id', value: req.params.id });
        }

        const foodItem = await FoodItemsModel.getById(id);

        if (!foodItem) {
            return sendNotFound(res, 'Food item not found', { foodItemId: id });
        }

        return sendSuccess(res, 200, foodItem);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/food-items
const createFoodItem = async (req, res) => {
    try {
        const { name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'category', 'caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required food item fields', { missingFields });
        }

        const invalidFields = validateNumericFields(req.body, ['caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g']);
        if (invalidFields.length > 0) {
            return sendValidationError(res, 'Invalid numeric food item fields', { invalidFields });
        }

        const newItem = await FoodItemsModel.create({ name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g });
        return sendSuccess(res, 201, newItem);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/food-items/:id
const updateFoodItem = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid food item id', { field: 'id', value: req.params.id });
        }

        const { name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g } = req.body;

        const missingFields = getMissingFields(req.body, ['name', 'category', 'caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required food item fields', { missingFields });
        }

        const invalidFields = validateNumericFields(req.body, ['caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g']);
        if (invalidFields.length > 0) {
            return sendValidationError(res, 'Invalid numeric food item fields', { invalidFields });
        }

        const updated = await FoodItemsModel.update(id, { name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g });

        if (!updated) {
            return sendNotFound(res, 'Food item not found', { foodItemId: id });
        }

        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/food-items/:id
const deleteFoodItem = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid food item id', { field: 'id', value: req.params.id });
        }

        const deleted = await FoodItemsModel.remove(id);

        if (!deleted) {
            return sendNotFound(res, 'Food item not found', { foodItemId: id });
        }

        return sendSuccess(res, 200, { foodItemId: deleted.foodItemId });
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/food-items/alternatives/:foodItemId?grams=<number>
const getAlternatives = async (req, res) => {
    try {
        const foodItemId = Number(req.params.foodItemId);
        const grams      = Number(req.query.grams);

        if (!validateId(foodItemId)) {
            return sendValidationError(res, 'Invalid food item id', { field: 'foodItemId', value: req.params.foodItemId });
        }
        if (!req.query.grams || isNaN(grams) || grams <= 0) {
            return sendValidationError(res, 'grams must be a positive number', { field: 'grams', value: req.query.grams });
        }

        const original = await FoodItemsModel.getById(foodItemId);
        if (!original) {
            return sendNotFound(res, 'Food item not found', { foodItemId });
        }

        const originalCalories = (original.caloriesPer100g / 100) * grams;

        const allFoodItems = await FoodItemsModel.getAll();
        const alternatives = allFoodItems
            .filter(alt => alt.category === original.category && alt.foodItemId !== foodItemId)
            .reduce((acc, alt) => {
                const alternativeGrams = Math.round((originalCalories / alt.caloriesPer100g) * 100);
                if (alternativeGrams >= 50 && alternativeGrams <= 500) {
                    acc.push({
                        foodItemId:       alt.foodItemId,
                        name:             alt.name,
                        category:         alt.category,
                        grams:            alternativeGrams,
                        calories:         Math.round(originalCalories),
                        protein:          Math.round((alt.proteinPer100g / 100) * alternativeGrams)
                    });
                }
                return acc;
            }, []);

        return sendSuccess(res, 200, alternatives);
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem, getAlternatives };

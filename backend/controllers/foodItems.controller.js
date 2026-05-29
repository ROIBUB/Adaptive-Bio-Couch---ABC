const FoodItemsModel = require('../models/foodItems.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields, validateNumericFields } = require('../middleware/validation');

// GET /api/food-items
const getAllFoodItems = (req, res) => {
    try {
        return sendSuccess(res, 200, FoodItemsModel.getAll());
    } catch (err) {
        return sendServerError(res);
    }
};

// GET /api/food-items/:id
const getFoodItemById = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid food item id', { field: 'id', value: req.params.id });
        }

        const foodItem = FoodItemsModel.getById(id);

        if (!foodItem) {
            return sendNotFound(res, 'Food item not found', { foodItemId: id });
        }

        return sendSuccess(res, 200, foodItem);
    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/food-items
const createFoodItem = (req, res) => {
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

        const newItem = FoodItemsModel.create({ name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g });
        return sendSuccess(res, 201, newItem);
    } catch (err) {
        return sendServerError(res);
    }
};

// PUT /api/food-items/:id
const updateFoodItem = (req, res) => {
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

        const updated = FoodItemsModel.update(id, { name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g });

        if (!updated) {
            return sendNotFound(res, 'Food item not found', { foodItemId: id });
        }

        return sendSuccess(res, 200, updated);
    } catch (err) {
        return sendServerError(res);
    }
};

// DELETE /api/food-items/:id
const deleteFoodItem = (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid food item id', { field: 'id', value: req.params.id });
        }

        const deleted = FoodItemsModel.remove(id);

        if (!deleted) {
            return sendNotFound(res, 'Food item not found', { foodItemId: id });
        }

        return sendSuccess(res, 200, { foodItemId: deleted.foodItemId });
    } catch (err) {
        return sendServerError(res);
    }
};

module.exports = { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem };

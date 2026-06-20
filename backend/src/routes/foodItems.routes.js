const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const {
    getAllFoodItems,
    getFoodItemById,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getAlternatives
} = require("../controllers/foodItems.controller");

// GET /api/food-items
router.get("/", getAllFoodItems);

// GET /api/food-items/alternatives/:foodItemId?grams=<number>
// Must be declared before /:id so the literal segment wins
router.get("/alternatives/:foodItemId", getAlternatives);

// GET /api/food-items/:id
router.get("/:id", getFoodItemById);

// POST /api/food-items
router.post("/", authorize(["admin", "manager"]), createFoodItem);

// PUT /api/food-items/:id
router.put("/:id", authorize(["admin", "manager"]), updateFoodItem);

// DELETE /api/food-items/:id
router.delete("/:id", authorize(["admin"]), deleteFoodItem);

module.exports = router;
const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const {
    getAllFoodItems,
    getFoodItemById,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem
} = require("../controllers/foodItems.controller");

// GET /api/food-items
router.get("/", getAllFoodItems);

// GET /api/food-items/:id
router.get("/:id", getFoodItemById);

// POST /api/food-items
router.post("/", authorize(["admin"]), createFoodItem);

// PUT /api/food-items/:id
router.put("/:id", authorize(["admin"]), updateFoodItem);

// DELETE /api/food-items/:id
router.delete("/:id", authorize(["admin"]), deleteFoodItem);

module.exports = router;
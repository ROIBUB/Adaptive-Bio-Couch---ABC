const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const {
    getAllDailyMealPlans,
    getDailyMealPlanById,
    createDailyMealPlan,
    updateDailyMealPlan,
    deleteDailyMealPlan
} = require("../controllers/dailyMealPlans.controller");

// GET /api/daily-meal-plans
router.get("/", authorize(["user", "admin", "manager"]), getAllDailyMealPlans);

// GET /api/daily-meal-plans/:id
router.get("/:id", authorize(["user", "admin", "manager"]), getDailyMealPlanById);

// POST /api/daily-meal-plans
router.post("/", authorize(["admin", "manager"]), createDailyMealPlan);

// PUT /api/daily-meal-plans/:id
router.put("/:id", authorize(["admin", "manager"]), updateDailyMealPlan);

// DELETE /api/daily-meal-plans/:id
router.delete("/:id", authorize(["admin"]), deleteDailyMealPlan);

module.exports = router;
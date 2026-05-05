const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const {
    getAllWorkoutPlans,
    getWorkoutPlanById,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
} = require("../controllers/workoutPlans.controller");

// GET /api/workout-plans
router.get("/", getAllWorkoutPlans);

// GET /api/workout-plans/:id
router.get("/:id", getWorkoutPlanById);

// POST /api/workout-plans
router.post("/", authorize(["admin"]), createWorkoutPlan);

// PUT /api/workout-plans/:id
router.put("/:id", authorize(["admin"]), updateWorkoutPlan);

// DELETE /api/workout-plans/:id
router.delete("/:id", authorize(["admin"]), deleteWorkoutPlan);

module.exports = router;
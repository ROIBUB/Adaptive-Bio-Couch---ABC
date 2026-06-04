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
router.get(
    "/",
    authorize(["user", "admin", "manager"]),
    getAllWorkoutPlans
);

// GET /api/workout-plans/:id
router.get(
    "/:id",
    authorize(["user", "admin", "manager"]),
    getWorkoutPlanById
);

// POST /api/workout-plans
router.post("/", authorize(["admin", "manager"]), createWorkoutPlan);

// PUT /api/workout-plans/:id
router.put("/:id", authorize(["admin", "manager"]), updateWorkoutPlan);

// DELETE /api/workout-plans/:id
router.delete("/:id", authorize(["admin"]), deleteWorkoutPlan);

module.exports = router;
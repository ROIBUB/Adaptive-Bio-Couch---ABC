const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const {
    getAllWorkoutLogs,
    getWorkoutLogById,
    createWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog
} = require("../controllers/workoutLogs.controller");

// GET /api/workout-logs
router.get("/", authorize(["user", "admin"]), getAllWorkoutLogs);

// GET /api/workout-logs/:id
router.get("/:id", authorize(["user", "admin"]), getWorkoutLogById);

// POST /api/workout-logs
router.post("/", authorize(["user", "admin"]), createWorkoutLog);

// PUT /api/workout-logs/:id
router.put("/:id", authorize(["user", "admin"]), updateWorkoutLog);

// DELETE /api/workout-logs/:id
router.delete("/:id", authorize(["user", "admin"]), deleteWorkoutLog);

module.exports = router;
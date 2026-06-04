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
router.get("/", authorize(["user", "admin", "manager"]), getAllWorkoutLogs);

// GET /api/workout-logs/:id
router.get("/:id", authorize(["user", "admin", "manager"]), getWorkoutLogById);

// POST /api/workout-logs
router.post("/", authorize(["user", "admin", "manager"]), createWorkoutLog);

// PUT /api/workout-logs/:id
router.put("/:id", authorize(["user", "admin", "manager"]), updateWorkoutLog);

// DELETE /api/workout-logs/:id
router.delete("/:id", authorize(["user", "admin"]), deleteWorkoutLog);

module.exports = router;
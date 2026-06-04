const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const {
    getAllCheckIns,
    getCheckInById,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn
} = require("../controllers/checkIns.controller");

// GET /api/check-ins
router.get("/", authorize(["user", "admin", "manager"]), getAllCheckIns);

// GET /api/check-ins/:id
router.get("/:id", authorize(["user", "admin", "manager"]), getCheckInById);

// POST /api/check-ins
router.post("/", authorize(["user", "admin", "manager"]), createCheckIn);

// PUT /api/check-ins/:id
router.put("/:id", authorize(["user", "admin", "manager"]), updateCheckIn);

// DELETE /api/check-ins/:id
router.delete("/:id", authorize(["user", "admin"]), deleteCheckIn);

module.exports = router;
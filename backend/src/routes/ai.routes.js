const express = require("express");
const router = express.Router();

const authorize = require("../middleware/auth");

const { analyzeProgress } = require("../services/aiAnalysisService");
const AiRecommendationsModel = require("../../models/aiRecommendations.model");
const { sendSuccess, sendServerError, sendValidationError } = require("../middleware/errorHandlers");

// POST /api/ai/recommendations
router.post("/recommendations", authorize(["user", "admin", "manager"]), async (req, res) => {
    try {
        const userId = Number(req.headers.userid);
        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'Missing or invalid userid header', { field: 'userid' });
        }
        const result = await analyzeProgress(userId);
        return sendSuccess(res, 201, result);
    } catch (err) {
        return sendServerError(res);
    }
});

// GET /api/ai/recommendations
router.get("/recommendations", authorize(["user", "admin", "manager"]), async (req, res) => {
    try {
        const userId = Number(req.headers.userid);
        const results = await AiRecommendationsModel.getByUserId(userId);
        return sendSuccess(res, 200, results);
    } catch (err) {
        return sendServerError(res);
    }
});

module.exports = router;

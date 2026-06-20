const express = require("express");
const router = express.Router();
const { getAIResponse } = require("../services/ai.service");

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: "VALIDATION_ERROR", message: "message is required", details: {} },
    });
  }

  try {
    const aiResponse = await getAIResponse(message.trim());
    return res.json({
      success: true,
      data: { message: aiResponse, timestamp: new Date().toISOString() },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "AI_ERROR", message: error.message || "AI service error", details: {} },
    });
  }
});

module.exports = router;

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are FitWise AI Coach, a friendly and knowledgeable fitness and nutrition assistant.
Rules:
- Give concise, practical advice (2-4 sentences max).
- If the user asks something
 unrelated to fitness, health, or nutrition, politely redirect them.
- Never provide medical diagnoses. Suggest consulting a professional when appropriate.
- Be encouraging and supportive in tone.
- Use metric units (kg, cm) by default.`
});

async function getAIResponse(userMessage) {
  try {
    const result = await model.generateContent(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
}

module.exports = { getAIResponse };

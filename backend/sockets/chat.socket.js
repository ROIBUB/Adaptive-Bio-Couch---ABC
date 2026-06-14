const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are FitWise AI Coach, a friendly and knowledgeable fitness and nutrition assistant.
Rules:
- Give concise, practical advice (2-4 sentences max).
- If the user asks something unrelated to fitness, health, or nutrition, politely redirect them.
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

function initChatSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('chat:join', ({ userId }) => {
      socket.join(`chat_${userId}`);
      socket.emit('chat:joined', { message: 'Connected to FitWise AI Coach' });
    });

    socket.on('chat:message', async ({ userId, message }) => {
      io.to(`chat_${userId}`).emit('chat:typing', { isTyping: true });
      const aiResponse = await getAIResponse(message);
      io.to(`chat_${userId}`).emit('chat:typing', { isTyping: false });
      io.to(`chat_${userId}`).emit('chat:response', {
        message: aiResponse,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initChatSocket };

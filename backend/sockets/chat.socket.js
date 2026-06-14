// TODO: Replace with real Anthropic Claude API call in Part 3
function getAIResponse(userMessage) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `AI Coach (mock): I received your message about '${userMessage}'. Once the Claude API is connected, I'll give you personalized fitness advice here.`
      );
    }, 1500);
  });
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

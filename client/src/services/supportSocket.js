import { io } from 'socket.io-client';

// Separate socket instance connected to the /support namespace.
// Kept entirely apart from the AI chat socket (socket.js) so they don't interfere.
const supportSocket = io('http://localhost:3000/support', {
    autoConnect: false,
});

export default supportSocket;

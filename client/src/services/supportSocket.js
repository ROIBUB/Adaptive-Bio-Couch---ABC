import { io } from 'socket.io-client';

const supportSocket = io('/support', { autoConnect: false });

export default supportSocket;

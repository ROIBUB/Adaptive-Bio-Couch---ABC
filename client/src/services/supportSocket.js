import { io } from 'socket.io-client';

const socket = io('/support', { autoConnect: false });

export default supportSocket;

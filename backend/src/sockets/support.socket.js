const SupportConversationModel = require('../../models/supportConversation.model');
const SupportMessageModel      = require('../../models/supportMessage.model');
const UserPresenceModel        = require('../../models/userPresence.model');

// userId → Set<socketId>  (handles multiple browser tabs per user)
const onlineSockets = new Map();

function addSocket(userId, socketId) {
    if (!onlineSockets.has(userId)) onlineSockets.set(userId, new Set());
    onlineSockets.get(userId).add(socketId);
}

function removeSocket(userId, socketId) {
    const set = onlineSockets.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) onlineSockets.delete(userId);
}

function isOnline(userId) {
    const set = onlineSockets.get(userId);
    return set ? set.size > 0 : false;
}

function initSupportSocket(io) {
    // Use a namespace to keep support events separate from AI chat events
    const support = io.of('/support');

    support.on('connection', (socket) => {
        console.log(`[Support] Socket connected: ${socket.id}`);

        // -----------------------------------------------------------------
        // support:join — client registers itself with userId + role
        // -----------------------------------------------------------------
        socket.on('support:join', async ({ userId, role }) => {
            if (!userId || !role) return;

            const uid = Number(userId);
            socket.data.userId = uid;
            socket.data.role   = role;

            // Every user joins their own private room
            socket.join(`user_support_${uid}`);

            // Admins/managers also join the shared admin room
            if (role === 'admin' || role === 'manager') {
                socket.join('support_admins');
            }

            addSocket(uid, socket.id);

            // Mark online in DB
            await UserPresenceModel.upsert(uid, { isOnline: true, lastSeen: new Date() }).catch(() => {});

            // Admin/manager presence must reach regular users (who are not in support_admins).
            // Regular user presence only needs to reach admins.
            if (role === 'admin' || role === 'manager') {
                support.emit('support:presence_update', { userId: uid, isOnline: true });
            } else {
                support.to('support_admins').emit('support:presence_update', { userId: uid, isOnline: true });
            }

            socket.emit('support:joined', { userId: uid, role });
        });

        // -----------------------------------------------------------------
        // support:message — send a chat message
        // -----------------------------------------------------------------
        socket.on('support:message', async ({ conversationUserId, message }) => {
            const senderId   = socket.data.userId;
            const senderRole = socket.data.role;

            if (!senderId || !senderRole || !conversationUserId || !message?.trim()) return;

            const convUserId = Number(conversationUserId);

            // Authorization: sender must be the conversation owner OR an admin/manager
            if (senderId !== convUserId && senderRole !== 'admin' && senderRole !== 'manager') {
                socket.emit('support:error', { message: 'Not authorized to send to this conversation' });
                return;
            }

            try {
                const conv = await SupportConversationModel.getOrCreate(convUserId);

                const newMsg = await SupportMessageModel.create({
                    conversationId: conv.id,
                    senderId,
                    senderRole,
                    message:        message.trim(),
                });

                await SupportConversationModel.updateTimestamp(conv.id);

                // Deliver to both the user's private room and all admins/managers
                support.to(`user_support_${convUserId}`).to('support_admins').emit('support:new_message', {
                    conversationUserId: convUserId,
                    message: newMsg,
                });
            } catch (err) {
                console.error('[Support] Error saving message:', err);
                socket.emit('support:error', { message: 'Failed to send message' });
            }
        });

        // -----------------------------------------------------------------
        // support:typing — broadcast typing indicator
        // -----------------------------------------------------------------
        socket.on('support:typing', ({ conversationUserId, isTyping }) => {
            if (!conversationUserId) return;
            const convUserId = Number(conversationUserId);

            // Broadcast to the other participants but not back to sender
            socket.to(`user_support_${convUserId}`).to('support_admins').emit('support:typing', {
                conversationUserId: convUserId,
                senderId: socket.data.userId,
                isTyping,
            });
        });

        // -----------------------------------------------------------------
        // disconnect
        // -----------------------------------------------------------------
        socket.on('disconnect', async () => {
            const uid = socket.data.userId;
            if (!uid) return;

            removeSocket(uid, socket.id);
            console.log(`[Support] Socket disconnected: ${socket.id} (user ${uid})`);

            if (!isOnline(uid)) {
                const now = new Date();
                await UserPresenceModel.upsert(uid, { isOnline: false, lastSeen: now }).catch(() => {});

                const payload = { userId: uid, isOnline: false, lastSeen: now.toISOString() };
                if (socket.data.role === 'admin' || socket.data.role === 'manager') {
                    support.emit('support:presence_update', payload);
                } else {
                    support.to('support_admins').emit('support:presence_update', payload);
                }
            }
        });
    });
}

module.exports = { initSupportSocket, isOnline };

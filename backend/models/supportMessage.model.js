const prisma = require('../prisma/prismaClient');

const mapMessage = (m) => ({
    id:             m.id,
    conversationId: m.conversation_id,
    senderId:       m.sender_id,
    senderRole:     m.sender_role,
    senderName:     m.sender
        ? `${m.sender.first_name} ${m.sender.last_name}`
        : null,
    message:   m.message,
    createdAt: m.created_at,
});

const create = async ({ conversationId, senderId, senderRole, message }) => {
    const created = await prisma.supportMessage.create({
        data: {
            conversation_id: conversationId,
            sender_id:       senderId,
            sender_role:     senderRole,
            message,
        },
        include: { sender: true },
    });
    return mapMessage(created);
};

const getByConversationId = async (conversationId) => {
    const msgs = await prisma.supportMessage.findMany({
        where:   { conversation_id: conversationId },
        include: { sender: true },
        orderBy: { created_at: 'asc' },
    });
    return msgs.map(mapMessage);
};

module.exports = { create, getByConversationId };

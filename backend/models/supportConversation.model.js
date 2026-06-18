const prisma = require('../prisma/prismaClient');

const mapConversation = (c) => ({
    id:        c.id,
    userId:    c.user_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    messages:  c.messages ? c.messages.map(mapMessage) : undefined,
});

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

const getByUserId = async (userId) => {
    const conv = await prisma.supportConversation.findUnique({
        where: { user_id: userId },
        include: {
            messages: {
                include: { sender: true },
                orderBy: { created_at: 'asc' },
            },
        },
    });
    return conv ? mapConversation(conv) : null;
};

const getAll = async () => {
    const convs = await prisma.supportConversation.findMany({
        include: {
            user: true,
            messages: {
                include: { sender: true },
                orderBy: { created_at: 'desc' },
                take: 1,
            },
        },
        orderBy: { updated_at: 'desc' },
    });
    return convs.map((c) => ({
        id:           c.id,
        userId:       c.user_id,
        userName:     `${c.user.first_name} ${c.user.last_name}`,
        userRole:     c.user.role,
        updatedAt:    c.updated_at,
        lastMessage:  c.messages[0] ? mapMessage(c.messages[0]) : null,
    }));
};

const getOrCreate = async (userId) => {
    const existing = await prisma.supportConversation.findUnique({
        where: { user_id: userId },
    });
    if (existing) return existing;
    return prisma.supportConversation.create({ data: { user_id: userId } });
};

const updateTimestamp = async (id) => {
    await prisma.supportConversation.update({
        where: { id },
        data:  { updated_at: new Date() },
    });
};

module.exports = { getByUserId, getAll, getOrCreate, updateTimestamp };

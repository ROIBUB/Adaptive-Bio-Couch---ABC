const prisma = require('../prisma/prismaClient');

const mapPresence = (p) => ({
    userId:   p.user_id,
    isOnline: p.is_online,
    lastSeen: p.last_seen,
});

const upsert = async (userId, { isOnline, lastSeen }) => {
    const result = await prisma.userPresence.upsert({
        where:  { user_id: userId },
        update: { is_online: isOnline, last_seen: lastSeen },
        create: { user_id: userId, is_online: isOnline, last_seen: lastSeen },
    });
    return mapPresence(result);
};

const getByUserId = async (userId) => {
    const p = await prisma.userPresence.findUnique({ where: { user_id: userId } });
    return p ? mapPresence(p) : null;
};

// Returns presence for all admin/manager users
const getAdminsPresence = async () => {
    const admins = await prisma.user.findMany({
        where: { role: { in: ['admin', 'manager'] } },
        include: { presence: true },
    });
    return admins.map((u) => ({
        userId:    u.id,
        firstName: u.first_name,
        lastName:  u.last_name,
        role:      u.role,
        isOnline:  u.presence?.is_online ?? false,
        lastSeen:  u.presence?.last_seen ?? null,
    }));
};

module.exports = { upsert, getByUserId, getAdminsPresence };

const SupportConversationModel = require('../../models/supportConversation.model');
const UserPresenceModel        = require('../../models/userPresence.model');
const prisma                   = require('../../prisma/prismaClient');
const { isOnline }             = require('../sockets/support.socket');
const { isAdminRole }          = require('../middleware/roleUtils');
const {
    sendSuccess,
    sendForbidden,
    sendValidationError,
    sendServerError,
} = require('../middleware/errorHandlers');
const { validateId } = require('../middleware/validation');

// GET /api/support/my-conversation
// Returns the logged-in user's full conversation with all messages.
const getMyConversation = async (req, res) => {
    try {
        const userId = Number(req.headers.userid);
        if (!validateId(userId)) {
            return sendValidationError(res, 'Missing or invalid user id', { field: 'userid' });
        }
        const conv = await SupportConversationModel.getByUserId(userId);
        if (!conv) {
            // Auto-create so the page always has a conversation to show
            await SupportConversationModel.getOrCreate(userId);
            return sendSuccess(res, 200, { id: null, userId, messages: [] });
        }
        return sendSuccess(res, 200, conv);
    } catch {
        return sendServerError(res);
    }
};

// GET /api/support/admins-presence
// Returns presence data for all admins/managers (for users to see if support is online).
const getAdminsPresence = async (req, res) => {
    try {
        const admins = await UserPresenceModel.getAdminsPresence();
        // Use live in-memory socket state so stale DB values from server restarts
        // never cause the indicator to show online when no admin is connected.
        return sendSuccess(res, 200, admins.map(a => ({ ...a, isOnline: isOnline(a.userId) })));
    } catch {
        return sendServerError(res);
    }
};

// GET /api/support/admin/users
// Admin/manager: returns all users with their conversations, presence, and last message.
const getAllUsersForAdmin = async (req, res) => {
    try {
        const userRole = req.headers['x-user-role'];
        if (!isAdminRole(userRole)) return sendForbidden(res, 'Admin or manager access required');

        const conversations = await SupportConversationModel.getAll();

        const presenceRows = await prisma.userPresence.findMany();
        const presenceMap = new Map(presenceRows.map((p) => [p.user_id, p]));

        const result = conversations.map((c) => {
            const p = presenceMap.get(c.userId);
            return {
                ...c,
                isOnline: p?.is_online ?? false,
                lastSeen: p?.last_seen ?? null,
            };
        });
        return sendSuccess(res, 200, result);
    } catch {
        return sendServerError(res);
    }
};

// GET /api/support/admin/conversation/:userId
// Admin/manager: returns full conversation for a specific user.
const getConversationByUserId = async (req, res) => {
    try {
        const userRole = req.headers['x-user-role'];
        if (!isAdminRole(userRole)) return sendForbidden(res, 'Admin or manager access required');

        const userId = Number(req.params.userId);
        if (!validateId(userId)) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId' });
        }

        let conv = await SupportConversationModel.getByUserId(userId);
        if (!conv) {
            await SupportConversationModel.getOrCreate(userId);
            conv = await SupportConversationModel.getByUserId(userId);
        }
        return sendSuccess(res, 200, conv);
    } catch {
        return sendServerError(res);
    }
};

module.exports = {
    getMyConversation,
    getAdminsPresence,
    getAllUsersForAdmin,
    getConversationByUserId,
};

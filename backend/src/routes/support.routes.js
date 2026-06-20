const router   = require('express').Router();
const authorize = require('../middleware/auth');
const {
    getMyConversation,
    getAdminsPresence,
    getAllUsersForAdmin,
    getConversationByUserId,
} = require('../controllers/support.controller');

// User routes — any authenticated role can access their own support conversation
router.get('/my-conversation',    authorize(['user', 'admin', 'manager']), getMyConversation);
router.get('/admins-presence',    authorize(['user', 'admin', 'manager']), getAdminsPresence);

// Admin/manager routes — see all conversations and open any user's chat
router.get('/admin/users',                     authorize(['admin', 'manager']), getAllUsersForAdmin);
router.get('/admin/conversation/:userId',      authorize(['admin', 'manager']), getConversationByUserId);

module.exports = router;

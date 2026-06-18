const router = require('express').Router();
const WorkoutPlansModel   = require('../models/workoutPlans.model');
const DailyMealPlansModel = require('../models/dailyMealPlans.model');
const CheckInsModel       = require('../models/checkIns.model');
const prisma              = require('../prisma/prismaClient');
const {
    sendSuccess,
    sendForbidden,
    sendValidationError,
    sendServerError
} = require('../middleware/errorHandlers');
const { isAdminRole } = require('../middleware/roleUtils');

// Every request to /api/admin/* must come from an admin or manager
router.use((req, res, next) => {
    if (!isAdminRole(req.headers['x-user-role'])) {
        return sendForbidden(res, 'Admin or manager access required');
    }
    next();
});

// GET /api/admin/workout-plans — all users' workout plans (Admin Panel list)
router.get('/workout-plans', async (req, res) => {
    try {
        return sendSuccess(res, 200, await WorkoutPlansModel.getAll());
    } catch {
        return sendServerError(res);
    }
});

// GET /api/admin/daily-meal-plans — all users' meal plans (Admin Panel list)
router.get('/daily-meal-plans', async (req, res) => {
    try {
        return sendSuccess(res, 200, await DailyMealPlansModel.getAll());
    } catch {
        return sendServerError(res);
    }
});

// GET /api/admin/users/stats — all users with current weight and check-in count
router.get('/users/stats', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                profile: true,
                _count: { select: { checkIns: true } }
            },
            orderBy: { id: 'asc' }
        });
        const result = users.map(u => ({
            userId:        u.id,
            firstName:     u.first_name,
            lastName:      u.last_name,
            userRole:      u.role,
            currentWeight: u.profile?.current_weight ?? null,
            checkInCount:  u._count.checkIns
        }));
        return sendSuccess(res, 200, result);
    } catch {
        return sendServerError(res);
    }
});

// GET /api/admin/check-ins/user/:userId — full check-in history for a specific user
router.get('/check-ins/user/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (!userId || isNaN(userId) || userId <= 0) {
            return sendValidationError(res, 'Invalid user id', { field: 'userId', value: req.params.userId });
        }
        const checkIns = await CheckInsModel.getByUserId(userId);
        return sendSuccess(res, 200, checkIns);
    } catch {
        return sendServerError(res);
    }
});

module.exports = router;

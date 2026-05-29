const UsersModel = require('../models/users.model');
const { sendSuccess, sendValidationError, sendServerError } = require('../middleware/errorHandlers');

// POST /api/auth/login
const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendValidationError(res, 'Email and password are required', {
                missingFields: [!email && 'email', !password && 'password'].filter(Boolean)
            });
        }

        const user = UsersModel.findByEmail(email);

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                data: null,
                error: { code: 'UNAUTHORIZED', message: 'Invalid email or password', details: {} }
            });
        }

        return sendSuccess(res, 200, {
            userId: user.userid,
            firstName: user.firstName,
            lastName: user.lastName,
            userRole: user.userRole,
            email: user.email
        });

    } catch (err) {
        return sendServerError(res);
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    return sendSuccess(res, 200, { message: 'Logged out successfully' });
};

module.exports = { login, logout };

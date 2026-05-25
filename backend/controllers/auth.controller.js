const usersModel = require('../models/users.model');
const { sendSuccess, sendValidationError, sendServerError } = require('../middleware/errorHandlers');

// POST /api/auth/login
// Finds the user by email + password and returns safe user info (no password).
// The frontend stores this and uses it as the "session" (no real sessions here).
const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendValidationError(res, 'Email and password are required', {
                missingFields: [!email && 'email', !password && 'password'].filter(Boolean)
            });
        }

        const user = usersModel.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password',
                    details: {}
                }
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
// No real session to destroy — just signals success so the frontend can clear localStorage.
const logout = (req, res) => {
    return sendSuccess(res, 200, { message: 'Logged out successfully' });
};

module.exports = { login, logout };

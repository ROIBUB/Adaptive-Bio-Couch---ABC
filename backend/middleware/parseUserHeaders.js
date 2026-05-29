const parseUserHeaders = (req, res, next) => {
    const rawUserId = req.headers["userid"] ?? req.headers["x-user-id"];
    const parsed = Number(rawUserId);
    req.userId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    req.userRole = req.headers["x-user-role"] || null;
    next();
};

module.exports = parseUserHeaders;

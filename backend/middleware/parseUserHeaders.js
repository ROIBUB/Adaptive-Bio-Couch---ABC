const parseUserHeaders = (req, res, next) => {
    const rawUserId = req.headers["userid"] ?? req.headers["x-user-id"];
    const parsed = Number(rawUserId);
    req.userId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

    const rawRole = req.headers["x-user-role"] || null;
    // 'manager' has the same permissions as 'admin' throughout the system
    const effectiveRole = rawRole === 'manager' ? 'admin' : rawRole;
    req.userRole = effectiveRole;
    req.headers["x-user-role"] = effectiveRole;
    next();
};

module.exports = parseUserHeaders;

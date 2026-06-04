const parseUserHeaders = (req, res, next) => {
    const rawUserId = req.headers["userid"] ?? req.headers["x-user-id"];
    const parsed = Number(rawUserId);
    req.userId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

    const rawRole = req.headers["x-user-role"] || null;
    req.userRole = rawRole;
    req.headers["x-user-role"] = rawRole;
    next();
};

module.exports = parseUserHeaders;

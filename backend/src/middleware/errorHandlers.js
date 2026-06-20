const sendSuccess = (res, statusCode, data) => {
    return res.status(statusCode).json({
        success: true,
        data: data,
        error: null
    });
};

const sendValidationError = (res, message, details = {}) => {
    return res.status(400).json({
        success: false,
        data: null,
        error: {
            code: "VALIDATION_ERROR",
            message: message,
            details: details
        }
    });
};

const sendForbidden = (res, message, details = {}) => {
    return res.status(403).json({
        success: false,
        data: null,
        error: {
            code: "FORBIDDEN",
            message: message,
            details: details
        }
    });
};

const sendNotFound = (res, message, details = {}) => {
    return res.status(404).json({
        success: false,
        data: null,
        error: {
            code: "NOT_FOUND",
            message: message,
            details: details
        }
    });
};

const sendServerError = (res) => {
    return res.status(500).json({
        success: false,
        data: null,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            details: {}
        }
    });
};

module.exports = {
    sendSuccess,
    sendValidationError,
    sendForbidden,
    sendNotFound,
    sendServerError
};
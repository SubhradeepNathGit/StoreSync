const ErrorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    
    if (err.statusCode >= 500 || !err.statusCode) {
        logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });
    } else {
        logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`);
    }

    
    if (err.statusCode !== 401 && error.statusCode !== 401) {
        console.error(err);
    } else {
        console.log(`[Auth] 401 Unauthorized: ${err.message || 'Access Denied'}`);
    }

    
    if (err.name === "CastError") {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    
    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new ErrorResponse(message, 400);
    }

    
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server Error",
    });
};

module.exports = errorHandler;

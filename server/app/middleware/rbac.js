const ErrorResponse = require("../utils/errorResponse");
const rolesConfig = require("../config/roles.json");

/**
 * Middleware to check if user has required permission
 * @param {string} permission - The permission required for the route
 */
exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse("Not authorized to access this route", 401));
        }

        
        if (!req.user.role) {
            return next(new ErrorResponse("User role not defined", 403));
        }

        const userRole = req.user.role.toLowerCase();
        const roleData = rolesConfig.roles.find((r) => r.name === userRole);

        if (!roleData) {
            return next(new ErrorResponse("Role not found", 403));
        }

        if (!roleData.permissions.includes(permission)) {
            return next(
                new ErrorResponse(
                    `Permission denied. Role '${userRole}' does not have '${permission}' permission.`,
                    403
                )
            );
        }

        next();
    };
};

/**
 * Middleware to check if user has required role
 * @param {...string} roles - The roles allowed for the route
 */
exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse("Not authorized to access this route", 401));
        }

        if (!req.user.role) {
            return next(new ErrorResponse("User role not defined", 403));
        }

        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return next(
                new ErrorResponse(
                    `Access denied. Requires role: ${roles.join(' or ')}`,
                    403
                )
            );
        }

        next();
    };
};

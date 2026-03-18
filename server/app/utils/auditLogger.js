const AuditLog = require("../models/AuditLog");

/**
 * Log a system activity
 * @param {Object} data - Log data
 * @param {string} data.action - Action performed (e.g., 'CREATE_PRODUCT')
 * @param {string} data.userId - ID of the user who performed the action
 * @param {string} data.details - Additional details about the action
 * @param {string} data.target - Target entity (e.g., 'Product')
 * @param {string} data.targetId - ID of the target entity
 * @param {string} data.shopId - ID of the shop
 * @param {Object} data.req - Express request object (optional, for IP/UA)
 */
exports.createLog = async (data) => {
    try {
        const logData = {
            action: data.action,
            user: data.userId,
            details: data.details,
            target: data.target,
            targetId: data.targetId,
            shopId: data.shopId
        };

        if (data.req) {
            logData.ipAddress = data.req.ip;
            logData.userAgent = data.req.headers['user-agent'];
        }

        await AuditLog.create(logData);
    } catch (err) {
        console.error("Audit log error:", err);
    }
};

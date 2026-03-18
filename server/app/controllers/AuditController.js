const AuditLog = require("../models/AuditLog");
const { statusCodes } = require("../helper/statusCode");

class AuditController {
    
    
    
    async getActivityLogs(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const query = { shopId: req.user.shopId };

            const totalLogs = await AuditLog.countDocuments(query);
            const logs = await AuditLog.find(query)
                .populate("user", "name email role")
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: logs,
                totalPages: Math.ceil(totalLogs / limit),
                currentPage: Number(page),
                totalLogs
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuditController();

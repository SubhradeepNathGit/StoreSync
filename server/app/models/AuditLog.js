const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        details: {
            type: String,
        },
        target: {
            type: String,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);

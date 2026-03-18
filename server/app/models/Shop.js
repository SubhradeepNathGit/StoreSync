const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a shop name"],
            trim: true,
            maxlength: [100, "Name can not be more than 100 characters"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isOnboarded: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);

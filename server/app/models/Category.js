const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a category name"],
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"],
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },
    },
    { timestamps: true }
);


CategorySchema.index({ name: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);

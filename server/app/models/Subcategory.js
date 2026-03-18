const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a subcategory name"],
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"],
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: true,
        },
        group: {
            type: String,
            required: [true, "Please add a group (e.g., Clothing, Footwear)"],
            trim: true,
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },
    },
    { timestamps: true }
);


SubcategorySchema.index({ name: 1, category: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Subcategory", SubcategorySchema);

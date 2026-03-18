const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please provide a task title"],
            trim: true,
            maxlength: [100, "Title cannot be more than 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Please provide a task description"],
            maxlength: [1000, "Description cannot be more than 1000 characters"],
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending",
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            
        },
        dueDate: {
            type: Date,
            required: [true, "Please provide a due date"],
        },
        attachments: [
            {
                name: String,
                url: String,
                fileType: String,
            },
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        isReadByAssignee: {
            type: Boolean,
            default: false,
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


TaskSchema.pre(/^find/, function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});


TaskSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "Completed") {
        this.completedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model("Task", TaskSchema);

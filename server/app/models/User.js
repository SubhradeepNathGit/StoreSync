const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 6,
            select: false,
        },
        profileImage: {
            type: String,
            default: "",
        },
        refreshToken: {
            type: String,
        },
        otp: {
            type: String,
        },
        otpExpire: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["super_admin", "owner", "manager", "employee", "shop_admin"],
            default: "employee",
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            
        },
        employeeId: {
            type: String,
            unique: true,
            sparse: true, 
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        joinedAt: {
            type: Date,
        },
        isFirstLogin: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        lastPasswordChange: {
            type: Date,
        },
        loginAttempts: {
            type: Number,
            required: true,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);


UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "15m",
    });
};


UserSchema.methods.getRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    });
};


UserSchema.methods.getResetPasswordToken = function () {
    
    const resetToken = crypto.randomBytes(20).toString("hex");

    
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


UserSchema.methods.setOtp = function (otp) {
    this.otp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};


UserSchema.methods.verifyOtp = function (enteredOtp) {
    const hashedOtp = crypto
        .createHash("sha256")
        .update(enteredOtp)
        .digest("hex");
    return this.otp === hashedOtp;
};

module.exports = mongoose.model("User", UserSchema);

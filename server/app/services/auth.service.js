const crypto = require("crypto");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const Shop = require("../models/Shop");
const { emitToSuperAdmin } = require("../utils/socket");


exports.register = async (userData) => {
    const { name, email, password, role, shopName } = userData;

    if (!role || !["owner", "manager"].includes(role)) {
        throw new ErrorResponse("Invalid role selected. Must be owner or manager.", 400);
    }

    if (!shopName) {
        throw new ErrorResponse("Please provide a shop name", 400);
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ErrorResponse("Email already registered", 400);
    }

    let shop;
    if (role === "owner") {
        
        shop = await Shop.create({
            name: shopName,
            isOnboarded: true 
        });
        emitToSuperAdmin('shopCreated', shop);
    } else {
        
        shop = await Shop.findOne({ name: shopName });
        if (!shop) {
            throw new ErrorResponse("Shop not found. Manager must join an existing shop.", 404);
        }
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 3 * 60 * 1000);

    
    const user = new User({
        name,
        email,
        password,
        role,
        shopId: shop._id,
        otpExpire,
        isVerified: false,
    });

    user.setOtp(otp);
    await user.save();

    emitToSuperAdmin('userCreated', user);

    return { user, otp };
};


exports.login = async (email, password) => {
    if (!email || !password) {
        throw new ErrorResponse("Please provide an email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ErrorResponse("Invalid credentials", 401);
    }

    
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        throw new ErrorResponse(`Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`, 401);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        
        user.loginAttempts += 1;

        
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000; 
        }

        await user.save();

        if (user.loginAttempts >= 5) {
            throw new ErrorResponse("Too many failed login attempts. Account locked for 15 minutes.", 401);
        }

        throw new ErrorResponse("Invalid credentials", 401);
    }

    if (!user.isVerified) {
        throw new ErrorResponse("Please verify your email to login", 401);
    }

    
    if (user.role !== "super_admin") {
        const shop = await Shop.findById(user.shopId);
        if (!shop) {
            throw new ErrorResponse("Your associated shop no longer exists. Please contact support.", 401);
        }
        if (!shop.isActive) {
            throw new ErrorResponse("This shop has been suspended by the platform administrator. Access denied.", 401);
        }
    }

    
    if (user.employeeId && !user.isActive) {
        throw new ErrorResponse("Your individual account has been deactivated. Please contact your administrator.", 401);
    }

    
    if (user.loginAttempts > 0 || user.lockUntil) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
    }

    
    if (!user.joinedAt) {
        user.joinedAt = new Date();
    }

    await user.save();

    return user;
};


exports.verifyEmail = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ErrorResponse("User not found", 404);
    }

    if (user.isVerified) {
        return user; 
    }

    if (!user.verifyOtp(otp)) {
        throw new ErrorResponse("Invalid OTP", 400);
    }

    if (user.otpExpire < Date.now()) {
        throw new ErrorResponse("OTP has expired", 400);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return user;
};


exports.resendOtp = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ErrorResponse("User not found", 404);
    }

    if (user.isVerified) {
        throw new ErrorResponse("Email already verified", 400);
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const otpExpire = new Date(Date.now() + 3 * 60 * 1000);

    user.setOtp(otp);
    user.otpExpire = otpExpire;
    await user.save();

    return { user, otp };
};


exports.updateRefreshToken = async (userId, refreshToken) => {
    await User.findByIdAndUpdate(userId, { refreshToken });
};


exports.logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
};


exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        return { user: null, resetToken: null };
    }

    
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    return { user, resetToken };
};


exports.resetPassword = async (resetToken, password) => {
    
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new ErrorResponse("Invalid token", 400);
    }

    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
};

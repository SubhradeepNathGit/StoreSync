const authService = require("../services/auth.service");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { statusCodes } = require("../helper/statusCode");
const { createLog } = require("../utils/auditLogger");

class AuthController {
    
    sendTokenResponse = async (user, statusCode, res) => {
        const accessToken = user.getSignedJwtToken();
        const refreshToken = user.getRefreshToken();

        await authService.updateRefreshToken(user._id, refreshToken);

        
        if (user.shopId && !user.shopId.name) {
            await user.populate('shopId');
        }

        
        let isOnboarded = true;

        res.status(statusCode).json({
            status: true,
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role,
                shopName: user.shopId?.name || "My Store",
                isFirstLogin: user.isFirstLogin || false,
                isOnboarded 
            }
        });
    }

    
    register = async (req, res, next) => {
        try {
            const { name, email, password, role, shopName } = req.body;

            if (!name || !email || !password || !role || !shopName) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "All fields are required (Name, Email, Password, Role, Shop Name)."
                });
            }

            const { user, otp } = await authService.register({ name, email, password, role, shopName });

            const message = `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000000; text-transform: uppercase;">StoreSync</h1>
                </div>
                <div style="border-top: 1px solid #edf2f7; padding-top: 32px;">
                    <p style="font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">Hi ${user.name},</p>
                    <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0;">
                        Welcome to StoreSync. To complete your registration as a ${user.role} for <strong>${shopName}</strong>, please use the following verification code.
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #000000; background-color: #f7fafc; padding: 20px 40px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 13px; color: #718096; text-align: center; margin: 32px 0 0 0;">
                        This code is valid for 3 minutes. Please do not share it with Anyone.
                    </p>
                    <div style="border-top: 1px solid #edf2f7; margin-top: 40px; padding-top: 32px; text-align: center;">
                        <p style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">Subhradeep Nath</p>
                        <p style="font-size: 12px; color: #718096; margin: 0;">App Developer, StoreSync</p>
                        <p style="font-size: 11px; color: #a0aec0; margin-top: 24px;">
                            &copy; ${new Date().getFullYear()} StoreSync. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: "Email Verification OTP",
                    html: message,
                });

                res.status(statusCodes.OK).json({
                    status: true,
                    success: true,
                    message: `OTP sent to ${user.email}`,
                    data: {
                        userId: user._id,
                        email: user.email
                    }
                });
            } catch (err) {
                console.log(err);
                return res.status(statusCodes.SERVER_ERROR).json({
                    status: false,
                    message: "Account created but email could not be sent. Please request a new OTP."
                });
            }
        } catch (err) {
            console.error("Register Error:", err);
            next(err);
        }
    }


    
    
    
    verifyEmail = async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            await authService.verifyEmail(email, otp);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: "Email verified successfully. Please login."
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    resendOtp = async (req, res, next) => {
        try {
            const { email } = req.body;
            const { user, otp } = await authService.resendOtp(email);

            const message = `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000000; text-transform: uppercase;">StoreSync</h1>
                </div>
                <div style="border-top: 1px solid #edf2f7; padding-top: 32px;">
                    <p style="font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">New Verification Code,</p>
                    <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0;">
                        Here is your new verification code. Please use it to complete your secure sign up process.
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #000000; background-color: #f7fafc; padding: 20px 40px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            ${otp}
                        </span>
                    </div>
                    <div style="border-top: 1px solid #edf2f7; margin-top: 40px; padding-top: 32px; text-align: center;">
                        <p style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">Subhradeep Nath</p>
                        <p style="font-size: 12px; color: #718096; margin: 0;">App Developer, StoreSync</p>
                    </div>
                </div>
            </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: "Account Verification OTP (Resend)",
                    html: message,
                });
                res.status(statusCodes.OK).json({
                    status: true,
                    success: true,
                    data: `OTP resent to ${user.email}`,
                });
            } catch (err) {
                return res.status(statusCodes.SERVER_ERROR).json({
                    status: false,
                    message: "Email could not be sent"
                });
            }
        } catch (err) {
            next(err);
        }
    }

    
    
    
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await authService.login(email, password);

            await createLog({
                action: 'LOGIN_SUCCESS',
                userId: user._id,
                details: `User logged in: ${user.email}`,
                target: 'User',
                targetId: user._id,
                shopId: user.shopId,
                req
            });

            await this.sendTokenResponse(user, statusCodes.OK, res);
        } catch (err) {
            
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                await createLog({
                    action: 'LOGIN_FAILURE',
                    userId: user._id,
                    details: `Failed login attempt for: ${user.email}. Message: ${err.message}`,
                    target: 'User',
                    targetId: user._id,
                    shopId: user.shopId,
                    req
                });
            }

            next(err);
        }
    }

    
    
    
    logout = async (req, res, next) => {
        try {
            await authService.logout(req.user.id);
            res.status(statusCodes.OK).json({ status: true, success: true, data: {} });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    getMe = async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id)
                .select("name email role profileImage isActive shopId")
                .populate('shopId', 'name');
            
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    isActive: user.isActive,
                    shopId: user.shopId?._id,
                    shopName: user.shopId?.name
                }
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    refreshToken = async (req, res, next) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(statusCodes.BAD_REQUEST).json({
                status: false,
                message: "Refresh token is required"
            });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    status: false,
                    message: "Invalid refresh token"
                });
            }

            if (!user.isActive) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    status: false,
                    message: "Account is deactivated"
                });
            }

            const newAccessToken = user.getSignedJwtToken();
            const newRefreshToken = user.getRefreshToken();
            await authService.updateRefreshToken(user._id, newRefreshToken);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        } catch (err) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: false,
                message: "Invalid refresh token"
            });
        }
    }

    
    
    
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const { user, resetToken } = await authService.forgotPassword(email);

            if (!user) {
                return res.status(statusCodes.OK).json({ 
                    status: true, 
                    success: true, 
                    data: "If that email is registered, a reset link has been sent to your inbox." 
                });
            }

            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

            const message = `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000000; text-transform: uppercase;">StoreSync</h1>
                </div>
                <div style="border-top: 1px solid #edf2f7; padding-top: 32px;">
                    <p style="font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">Hi,</p>
                    <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0;">
                        You requested a password reset for your StoreSync account. Please click the button below to set a new password. This link will expire in 10 minutes.
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="font-size: 13px; color: #718096; text-align: center; margin: 32px 0 0 0;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                    <div style="border-top: 1px solid #edf2f7; margin-top: 40px; padding-top: 32px; text-align: center;">
                        <p style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">Subhradeep Nath</p>
                        <p style="font-size: 12px; color: #718096; margin: 0;">App Developer, StoreSync</p>
                        <p style="font-size: 11px; color: #a0aec0; margin-top: 24px;">
                            &copy; ${new Date().getFullYear()} StoreSync. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
            `;

            try {
                await sendEmail({ email: user.email, subject: "Password Reset", html: message });
                res.status(statusCodes.OK).json({ status: true, success: true, data: "If that email is registered, a reset link has been sent to your inbox." });
            } catch (err) {
                console.error("Forgot Password Email Error: ", err);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });
                return res.status(statusCodes.SERVER_ERROR).json({
                    status: false,
                    message: "Email could not be sent"
                });
            }
        } catch (err) {
            next(err);
        }
    }

    
    
    
    resetPassword = async (req, res, next) => {
        try {
            const { password } = req.body;
            await authService.resetPassword(req.params.resettoken, password);
            res.status(statusCodes.OK).json({ 
                status: true, 
                success: true, 
                data: "Password reset successful. Please login with your new password." 
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    updatePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user.id).select('+password');

            if (!(await user.matchPassword(currentPassword))) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    status: false,
                    message: "Incorrect current password"
                });
            }

            user.password = newPassword;
            if (user.isFirstLogin) user.isFirstLogin = false;
            user.lastPasswordChange = Date.now();
            await user.save();

            await this.sendTokenResponse(user, statusCodes.OK, res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();

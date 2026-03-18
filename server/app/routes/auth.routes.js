const express = require("express");
const {
    register,
    login,
    verifyEmail,
    resendOtp,
    logout,
    getMe,
    refreshToken,
    forgotPassword,
    resetPassword,
    updatePassword
} = require("../controllers/AuthController");

const { protect } = require("../middleware/auth");

const { registerValidation, loginValidation } = require("../middleware/validators");

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", loginValidation, login);
router.get("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/refresh", refreshToken);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;

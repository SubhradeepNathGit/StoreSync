const express = require("express");
const {
    getProfile,
    updateProfile,
    updatePassword,
} = require("../controllers/UserController");

const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", upload.single("profileImage"), updateProfile);
router.put("/update-password", updatePassword);

module.exports = router;

const userService = require("../services/user.service");
const { statusCodes } = require("../helper/statusCode");

class UserController {
    
    
    
    async getProfile(req, res, next) {
        try {
            const user = await userService.getUserProfile(req.user.id);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async updateProfile(req, res, next) {
        try {
            const fieldsToUpdate = {
                name: req.body.name,
                email: req.body.email,
            };

            if (req.file) {
                fieldsToUpdate.profileImage = req.file.path;
            }

            const user = await userService.updateUserProfile(req.user.id, fieldsToUpdate);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async updatePassword(req, res, next) {
        try {
            await userService.updatePassword(
                req.user.id,
                req.body.currentPassword,
                req.body.newPassword
            );

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: {},
                message: "Password updated successfully",
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();

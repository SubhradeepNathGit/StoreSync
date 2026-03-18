const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(
                new ErrorResponse("No user found with this id", 404)
            );
        }

        if (!req.user.isActive) {
            return next(
                new ErrorResponse("Your account has been deactivated. Please contact support.", 401)
            );
        }

        
        if (req.user.role !== "super_admin" && req.user.shopId) {
            const Shop = require("../models/Shop");
            const shop = await Shop.findById(req.user.shopId);
            if (!shop || !shop.isActive) {
                return next(
                    new ErrorResponse("This shop has been suspended or no longer exists. Access denied.", 401)
                );
            }
        }

        next();
    } catch (err) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
};

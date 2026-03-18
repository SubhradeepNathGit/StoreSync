const { body, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");


const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map((err) => err.msg).join(", ");
        return next(new ErrorResponse(message, 400));
    }
    next();
};


exports.registerValidation = [
    body("shopName").trim().notEmpty().withMessage("Shop name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    validate,
];

exports.loginValidation = [
    body("email").trim().notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
];


exports.productValidation = [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required")
        .isMongoId()
        .withMessage("Invalid category"),
    validate,
];

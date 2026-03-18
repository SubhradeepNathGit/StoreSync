const Joi = require('joi');
const ErrorResponse = require('../utils/errorResponse');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new ErrorResponse(message, 400));
        }
        next();
    };
};

const productSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Product name is required'
    }),
    description: Joi.string().trim().required().messages({
        'string.empty': 'Description is required'
    }),
    price: Joi.number().positive().required().messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be a positive number'
    }),
    category: Joi.string().trim().required().messages({
        'string.empty': 'Category is required'
    }),
    subcategory: Joi.string().trim().allow('', null).optional(),
    inStock: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
});

module.exports = {
    validateRequest,
    productSchema
};

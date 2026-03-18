const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const { statusCodes } = require("../helper/statusCode");
const { emitToShop } = require("../utils/socket");

class CategoryController {
    
    
    
    async getCategories(req, res, next) {
        try {
            const queryData = {};
            if (req.user && req.user.role !== 'super_admin') {
                queryData.shopId = req.user.shopId;
            }
            const categories = await Category.find(queryData).sort({ name: 1 });
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: categories,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getSubcategories(req, res, next) {
        try {
            const queryData = { category: req.params.categoryId };
            if (req.user && req.user.role !== 'super_admin') {
                queryData.shopId = req.user.shopId;
            }
            const subcategories = await Subcategory.find(queryData).sort({ name: 1 });
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: subcategories,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getAllCategoriesWithSubcategories(req, res, next) {
        try {
            const matchStage = {};
            if (req.user && req.user.role !== 'super_admin') {
                const mongoose = require("mongoose");
                matchStage.shopId = new mongoose.Types.ObjectId(req.user.shopId);
            }

            const pipeline = [];
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }

            pipeline.push(
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "_id",
                        foreignField: "category",
                        as: "subcategories",
                    },
                },
                { $sort: { name: 1 } }
            );

            const categories = await Category.aggregate(pipeline);

            
            const formattedCategories = categories.map(cat => ({
                ...cat,
                subcategories: (cat.subcategories || []).sort((a, b) => a.name.localeCompare(b.name))
            }));

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: formattedCategories,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async deleteCategory(req, res, next) {
        try {
            if (req.user.role !== 'owner') {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    status: false,
                    message: "Only store owners can delete categories"
                });
            }

            const categoryId = req.params.categoryId;
            const shopId = req.user.shopId;

            const category = await Category.findOne({ _id: categoryId, shopId });
            if (!category) {
                return res.status(statusCodes.NOT_FOUND).json({
                    status: false,
                    message: "Category not found"
                });
            }

            const Product = require("../models/Product");
            
            await Product.deleteMany({ category: categoryId, shopId });

            
            await Subcategory.deleteMany({ category: categoryId, shopId });

            
            await Category.deleteOne({ _id: categoryId, shopId });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: "Category and all its products removed successfully"
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async deleteSubcategory(req, res, next) {
        try {
            if (req.user.role !== 'owner') {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    status: false,
                    message: "Only store owners can delete subcategories"
                });
            }

            const subcategoryId = req.params.subcategoryId;
            const shopId = req.user.shopId;

            const subcategory = await Subcategory.findOne({ _id: subcategoryId, shopId });
            if (!subcategory) {
                return res.status(statusCodes.NOT_FOUND).json({
                    status: false,
                    message: "Subcategory not found"
                });
            }

            const Product = require("../models/Product");
            
            await Product.deleteMany({ subcategory: subcategoryId, shopId });

            
            await Subcategory.deleteOne({ _id: subcategoryId, shopId });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: "Subcategory and its products removed successfully"
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async createCategory(req, res, next) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Please provide a category name"
                });
            }

            
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
                shopId: req.user.shopId
            });

            if (existingCategory) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Category already exists in this shop"
                });
            }

            const category = await Category.create({
                name,
                shopId: req.user.shopId
            });

            res.status(statusCodes.CREATED).json({
                status: true,
                success: true,
                data: category
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Category already exists in this shop"
                });
            }
            next(err);
        }
    }

    
    
    
    async createSubcategory(req, res, next) {
        try {
            const { name, category, group } = req.body;
            if (!name || !category || !group) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Please provide name, category ID, and group"
                });
            }

            
            const existingSubcategory = await Subcategory.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
                category,
                shopId: req.user.shopId
            });

            if (existingSubcategory) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Subcategory already exists in this category"
                });
            }

            const subcategory = await Subcategory.create({
                name,
                category,
                group,
                shopId: req.user.shopId
            });

            res.status(statusCodes.CREATED).json({
                status: true,
                success: true,
                data: subcategory
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Subcategory already exists in this category"
                });
            }
            next(err);
        }
    }
}


function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = new CategoryController();

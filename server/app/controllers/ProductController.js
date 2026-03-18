const productService = require("../services/product.service");
const csvHelper = require("../helper/csvHelper");
const fs = require("fs");
const mongoose = require("mongoose");
const { statusCodes } = require("../helper/statusCode");
const Product = require("../models/Product");
const { createLog } = require("../utils/auditLogger");
const { emitToShop, emitToSuperAdmin } = require("../utils/socket");

class ProductController {
    
    
    
    async getProducts(req, res, next) {
        try {
            
            const queryData = { ...req.query };
            if (req.user && req.user.role !== 'super_admin') {
                queryData.shopId = req.user.shopId;
            }

            const data = await productService.getProducts(queryData);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: data,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getProduct(req, res, next) {
        try {
            const product = await productService.getProductById(req.params.id, req.user?.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: product,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async createProduct(req, res, next) {
        try {
            const productData = {
                ...req.body,
                shopId: req.user.shopId,
            };
            if (req.file) {
                productData.image = req.file.path;
            }

            const product = await productService.createProduct(productData, req.user.id);

            await createLog({
                action: 'CREATE_PRODUCT',
                userId: req.user.id,
                details: `Product '${product.name}' created`,
                target: 'Product',
                targetId: product._id,
                shopId: req.user.shopId,
                req
            });

            res.status(statusCodes.CREATED).json({
                status: true,
                success: true,
                data: product,
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED', product);
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async updateProduct(req, res, next) {
        try {
            const productData = {
                ...req.body,
            };
            if (req.file) {
                productData.image = req.file.path;
            }

            const product = await productService.updateProduct(req.params.id, req.user.id, productData, req.user.role, req.user.shopId);

            await createLog({
                action: 'UPDATE_PRODUCT',
                userId: req.user.id,
                details: `Product '${product.name}' updated`,
                target: 'Product',
                targetId: product._id,
                shopId: req.user.shopId,
                req
            });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: product,
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED', product);
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async deleteProduct(req, res, next) {
        try {
            const result = await productService.deleteProduct(req.params.id, req.user.id, req.user.role, req.user.shopId);

            await createLog({
                action: 'DELETE_PRODUCT',
                userId: req.user.id,
                details: `Product with ID ${req.params.id} soft-deleted`,
                target: 'Product',
                targetId: req.params.id,
                shopId: req.user.shopId,
                req
            });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: result,
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED', { id: req.params.id });
        } catch (err) {
            next(err);
        }
    }

    async restoreProduct(req, res, next) {
        try {
            const result = await productService.restoreProduct(req.params.id, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: result,
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED', result);
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async forceDeleteProduct(req, res, next) {
        try {
            const result = await productService.forceDeleteProduct(req.params.id, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                ...result
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED', { id: req.params.id });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async importCsvProducts(req, res, next) {
        try {
            if (!req.file) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    message: "Please upload a CSV file"
                });
            }

            const buffer = fs.readFileSync(req.file.path);
            const { products, errors } = await csvHelper.parseCsvBuffer(buffer, req.user.shopId);

            
            fs.unlinkSync(req.file.path);

            if (products.length === 0 && errors.length > 0) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    success: false,
                    message: "No valid products found in CSV",
                    errors
                });
            }

            const createdProducts = [];
            const creationErrors = [];

            for (const productData of products) {
                try {
                    
                    const existingProduct = await Product.findOne({
                        name: productData.name,
                        shopId: req.user.shopId
                    });

                    if (existingProduct) {
                        creationErrors.push({ product: productData.name, message: "Skipped duplicate product" });
                        continue;
                    }

                    const enrichedData = {
                        ...productData,
                        shopId: req.user.shopId
                    };

                    const product = await productService.createProduct(enrichedData, req.user.id);
                    createdProducts.push(product);
                } catch (err) {
                    creationErrors.push({ product: productData.name, message: err.message });
                }
            }

            await createLog({
                action: 'IMPORT_PRODUCTS',
                userId: req.user.id,
                details: `Imported ${createdProducts.length} products from CSV, ${errors.length + creationErrors.length} failed`,
                target: 'Product',
                shopId: req.user.shopId,
                req
            });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                summary: {
                    totalRows: products.length + errors.length,
                    imported: createdProducts.length,
                    failed: errors.length + creationErrors.length,
                },
                errors: [...errors, ...creationErrors]
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED');
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            next(err);
        }
    }

    
    
    
    async bulkDeleteProducts(req, res, next) {
        try {
            if (req.user.role !== 'owner') {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    status: false,
                    message: "Only store owners can perform this action"
                });
            }
            const result = await productService.bulkDeleteProducts(req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                ...result
            });

            emitToShop(req.user.shopId, 'PRODUCT_UPDATED');
            emitToSuperAdmin('PRODUCT_UPDATED');
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getShopMetrics(req, res, next) {
        try {
            const shopId = req.user.shopId;

            const totalProducts = await Product.countDocuments({ shopId, isDeleted: false });
            const inStock = await Product.countDocuments({ shopId, isDeleted: false, inStock: true });
            const outOfStock = await Product.countDocuments({ shopId, isDeleted: false, inStock: false });
            const deletedProducts = await Product.countDocuments({ shopId, isDeleted: true });

            
            const categoryStats = await Product.aggregate([
                {
                    $match: {
                        shopId: new mongoose.Types.ObjectId(shopId),
                        isDeleted: false
                    }
                },
                { $group: { _id: "$category", count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "categoryInfo"
                    }
                },
                { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            
            const subcategoryStats = await Product.aggregate([
                {
                    $match: {
                        shopId: new mongoose.Types.ObjectId(shopId),
                        isDeleted: false
                    }
                },
                { $group: { _id: "$subcategory", count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "subInfo"
                    }
                },
                { $unwind: { path: "$subInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: { $ifNull: ["$subInfo.name", "General"] },
                        count: 1,
                        _id: 0
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            
            const priceRanges = await Product.aggregate([
                {
                    $match: {
                        shopId: new mongoose.Types.ObjectId(shopId),
                        isDeleted: false
                    }
                },
                {
                    $bucket: {
                        groupBy: "$price",
                        boundaries: [0, 500, 1000, 5000, 10000, 50000],
                        default: "Premium",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]);

            const priceDistribution = priceRanges.map(range => {
                let name = "";
                if (range._id === 0) name = "Under ₹500";
                else if (range._id === 500) name = "₹500 - ₹1k";
                else if (range._id === 1000) name = "₹1k - ₹5k";
                else if (range._id === 5000) name = "₹5k - ₹10k";
                else if (range._id === 10000) name = "₹10k - ₹50k";
                else name = "Above ₹50k";
                return { name, count: range.count };
            });

            
            const productGrowth = await Product.aggregate([
                {
                    $match: {
                        shopId: new mongoose.Types.ObjectId(shopId),
                        isDeleted: false,
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } },
                {
                    $project: {
                        date: "$_id",
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            
            const contributorStats = await Product.aggregate([
                {
                    $match: {
                        shopId: new mongoose.Types.ObjectId(shopId),
                        isDeleted: false
                    }
                },
                { $group: { _id: "$createdBy", count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: { $ifNull: ["$userInfo.name", "Unknown"] },
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            
            const priceStats = await Product.aggregate([
                { $match: { shopId: new mongoose.Types.ObjectId(shopId), isDeleted: false } },
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: "$price" },
                        maxPrice: { $max: "$price" },
                        totalValue: { $sum: "$price" }
                    }
                }
            ]);
            const minPrice = priceStats[0]?.minPrice ?? 0;
            const maxPrice = priceStats[0]?.maxPrice ?? 50000;
            const totalInventoryValue = priceStats[0]?.totalValue ?? 0;

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: {
                    totalProducts,
                    inStock,
                    outOfStock,
                    deletedProducts,
                    categoryStats,
                    subcategoryStats,
                    priceDistribution,
                    productGrowth,
                    contributorStats,
                    minPrice,
                    maxPrice,
                    totalInventoryValue
                }
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProductController();

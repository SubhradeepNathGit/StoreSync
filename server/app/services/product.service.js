const Product = require("../models/Product");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");


exports.createProduct = async (productData, userId) => {
    const product = await Product.create({
        ...productData,
        createdBy: userId,
    });
    return product;
};


exports.getProducts = async (query) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        category = "",
        subcategory = "",
        userId = "",
        isDeleted,
        minPrice,
        maxPrice,
        inStock,
        sort,
        shopId
    } = query;

    const mongoose = require("mongoose");

    const matchStage = {
        isDeleted: isDeleted === "true",
    };

    if (shopId) {
        matchStage.shopId = new mongoose.Types.ObjectId(shopId);
    }

    if (search) {
        matchStage.name = { $regex: search, $options: "i" };
    }

    if (category) {
        matchStage.category = new mongoose.Types.ObjectId(category);
    }

    if (subcategory) {
        matchStage.subcategory = new mongoose.Types.ObjectId(subcategory);
    }

    if (userId) {
        matchStage.createdBy = new mongoose.Types.ObjectId(userId);
    }

    if (minPrice || maxPrice) {
        matchStage.price = {};
        if (minPrice) matchStage.price.$gte = Number(minPrice);
        if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }

    if (inStock !== undefined && inStock !== "") {
        matchStage.inStock = inStock === "true";
    }

    
    let sortStage = { createdAt: -1 };
    if (sort) {
        switch (sort) {
            case "price_asc":
                sortStage = { price: 1 };
                break;
            case "price_desc":
                sortStage = { price: -1 };
                break;
            case "latest":
                sortStage = { createdAt: -1 };
                break;
            case "a_z":
                sortStage = { name: 1 };
                break;
            case "z_a":
                sortStage = { name: -1 };
                break;
            default:
                sortStage = { createdAt: -1 };
        }
    }

    
    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "subcategories",
                localField: "subcategory",
                foreignField: "_id",
                as: "subcategoryDetails"
            }
        },
        { $unwind: { path: "$subcategoryDetails", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: 1,
                description: 1,
                price: 1,
                inStock: 1,
                image: 1,
                isDeleted: 1,
                createdAt: 1,
                category: "$categoryDetails",
                subcategory: "$subcategoryDetails",
                createdBy: {
                    _id: "$userDetails._id",
                    name: "$userDetails.name",
                    email: "$userDetails.email"
                }
            }
        },
        { $sort: sortStage },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: (Number(page) - 1) * Number(limit) }, { $limit: Number(limit) }]
            }
        }
    ];

    const results = await Product.aggregate(pipeline);

    const products = results[0].data;
    const total = results[0].metadata[0] ? results[0].metadata[0].total : 0;

    return {
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        totalProducts: total,
    };
};


exports.getProductById = async (productId, shopId) => {
    const query = { _id: productId };
    if (shopId) query.shopId = shopId;

    const product = await Product.findOne(query)
        .populate("category", "name")
        .populate("subcategory", "name")
        .populate("createdBy", "name email");

    if (!product) {
        throw new ErrorResponse("Product not found", 404);
    }

    return product;
};


exports.updateProduct = async (productId, userId, updateData, userRole, shopId) => {
    const query = { _id: productId };
    if (shopId) query.shopId = shopId;

    let product = await Product.findOne(query);

    if (!product || product.isDeleted) {
        throw new ErrorResponse("Product not found", 404);
    }

    
    const canUpdateAny = userRole === 'owner' || userRole === 'manager' || userRole === 'employee' || userRole === 'super_admin';
    if (!canUpdateAny && product.createdBy && product.createdBy.toString() !== userId) {
        throw new ErrorResponse("Not authorized to update this product. Only store owners, managers, employees, or the creator can perform this action.", 401);
    }

    
    if (!product.createdBy) {
        updateData.createdBy = userId;
    }

    
    if (updateData.image && product.image && product.image !== "no-photo.jpg") {
        try {
            
            const parts = product.image.split("product-listing/");
            if (parts.length > 1) {
                const afterFolder = parts[1];
                const lastDotIndex = afterFolder.lastIndexOf(".");
                const filename =
                    lastDotIndex !== -1 ? afterFolder.substring(0, lastDotIndex) : afterFolder;
                const publicId = `product-listing/${filename}`;
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (err) {
            console.error("Cloudinary delete error", err);
            
        }
    }

    product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
    });

    return product;
};


exports.deleteProduct = async (productId, userId, userRole, shopId) => {
    const query = { _id: productId };
    if (shopId) query.shopId = shopId;

    const product = await Product.findOne(query);

    if (!product || product.isDeleted) {
        throw new ErrorResponse("Product not found", 404);
    }

    
    // Check permissions: Owner, Manager, Employee, or Admin
    const canDelete = userRole === 'owner' || userRole === 'manager' || userRole === 'employee' || userRole === 'super_admin';
    if (!canDelete) {
        throw new ErrorResponse("Not authorized to delete products. Only store owners, managers, or employees can perform this action.", 401);
    }

    

    product.isDeleted = true;
    await product.save();

    return { message: "Product deleted successfully" };
};


exports.restoreProduct = async (productId, userId, userRole, shopId) => {
    const query = { _id: productId };
    if (shopId) query.shopId = shopId;

    
    const product = await Product.findOne(query);

    if (!product) {
        throw new ErrorResponse("Product not found", 404);
    }

    
    // Check permissions: Owner, Manager, Employee, or Admin
    const canRestore = userRole === 'owner' || userRole === 'manager' || userRole === 'employee' || userRole === 'super_admin';
    if (!canRestore) {
        throw new ErrorResponse("Not authorized to restore products. Only store owners, managers, or employees can perform this action.", 401);
    }

    product.isDeleted = false;
    
    if (!product.createdBy) {
        product.createdBy = userId;
    }

    await product.save();

    return { message: "Product restored successfully" };
};


exports.forceDeleteProduct = async (productId, userId, userRole, shopId) => {
    const query = { _id: productId };
    if (shopId) query.shopId = shopId;

    const product = await Product.findOne(query);

    if (!product) {
        throw new ErrorResponse("Product not found", 404);
    }

    
    // Check permissions: Owner, Manager, Employee, or Admin
    const canPermanentlyDelete = userRole === 'owner' || userRole === 'manager' || userRole === 'employee' || userRole === 'super_admin';
    if (!canPermanentlyDelete) {
        throw new ErrorResponse("Not authorized to permanently delete products. Only store owners, managers, or employees can perform this action.", 401);
    }

    
    if (product.image && product.image !== "no-photo.jpg") {
        try {
            
            const parts = product.image.split("product-listing/");
            if (parts.length > 1) {
                const afterFolder = parts[1];
                const lastDotIndex = afterFolder.lastIndexOf(".");
                const filename =
                    lastDotIndex !== -1 ? afterFolder.substring(0, lastDotIndex) : afterFolder;
                const publicId = `product-listing/${filename}`;
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (err) {
            console.error("Cloudinary delete error", err);
        }
    }

    await Product.findByIdAndDelete(productId);

    return { message: "Product permanently deleted" };
};

exports.bulkDeleteProducts = async (shopId) => {
    if (!shopId) {
        throw new ErrorResponse("Shop ID is required for bulk deletion", 400);
    }
    
    const fs = require('fs');
    const path = require('path');

    
    const products = await Product.find({ shopId });

    
    const imagePublicIds = [];
    const localImagePaths = [];

    products.forEach(p => {
        if (p.image && p.image !== "no-photo.jpg") {
            const parts = p.image.split("product-listing/");
            if (parts.length > 1) {
                const afterFolder = parts[1];
                const lastDotIndex = afterFolder.lastIndexOf(".");
                const filename = lastDotIndex !== -1 ? afterFolder.substring(0, lastDotIndex) : afterFolder;
                imagePublicIds.push(`product-listing/${filename}`);
            } else if (!p.image.startsWith('http')) {
                localImagePaths.push(p.image);
            }
        }
    });

    if (imagePublicIds.length > 0) {
        try {
            
            for (let i = 0; i < imagePublicIds.length; i += 50) {
                const chunk = imagePublicIds.slice(i, i + 50);
                await cloudinary.api.delete_resources(chunk);
            }
        } catch (err) {
            console.error("Cloudinary bulk delete error:", err);
            
        }
    }

    
    localImagePaths.forEach(img => {
        try {
            
            const possiblePaths = [
                path.join(__dirname, '../../uploads', img),
                path.join(__dirname, '../../../uploads', img),
                path.join(__dirname, '../../public/uploads', img)
            ];
            
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    fs.unlinkSync(p);
                    break;
                }
            }
        } catch (err) {
            console.error("Local image delete error:", err);
        }
    });

    
    await Product.deleteMany({ shopId });

    
    await Subcategory.deleteMany({ shopId });
    await Category.deleteMany({ shopId });

    return { message: "Your inventory has been completely cleared, including all images, categories, and subcategories." };
};

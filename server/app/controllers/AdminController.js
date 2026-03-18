const Shop = require('../models/Shop');
const User = require('../models/User');
const Product = require('../models/Product');
const { statusCodes } = require('../helper/statusCode');
const { emitToSuperAdmin } = require('../utils/socket');

class AdminController {
    
    async getAllShops(req, res, next) {
        try {
            
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can access platform data",
                });
            }

            const shops = await Shop.find().sort({ createdAt: -1 });
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                count: shops.length,
                data: shops,
            });
        } catch (err) {
            next(err);
        }
    }

    async toggleShopStatus(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can toggle shop status",
                });
            }

            const shop = await Shop.findById(req.params.id);
            if (!shop) {
                return res.status(statusCodes.NOT_FOUND).json({
                    status: false,
                    message: "Shop not found",
                });
            }

            shop.isActive = !shop.isActive;
            await shop.save();

            emitToSuperAdmin('shopUpdated', shop);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: `Shop ${shop.isActive ? 'activated' : 'deactivated'} successfully`,
                data: shop,
            });
        } catch (err) {
            next(err);
        }
    }

    async getPlatformMetrics(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can view platform metrics",
                });
            }

            const totalShops = await Shop.countDocuments();
            const totalUsers = await User.countDocuments({ role: { $ne: 'super_admin' } });
            const totalProducts = await Product.countDocuments();
            const activeShops = await Shop.countDocuments({ isActive: true });

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            sixMonthsAgo.setHours(0, 0, 0, 0);

            const shopTrend = await Shop.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);

            const productTrend = await Product.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const platformTrend = [];
            for (let i = 0; i < 6; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                const m = date.getMonth() + 1;
                const y = date.getFullYear();

                const sCount = shopTrend.find(t => t._id.month === m && t._id.year === y)?.count || 0;
                const pCount = productTrend.find(t => t._id.month === m && t._id.year === y)?.count || 0;

                platformTrend.push({
                    month: months[date.getMonth()],
                    shops: sCount,
                    products: pCount
                });
            }

            const recentShops = await Shop.find().sort({ createdAt: -1 }).limit(5);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: {
                    totalShops,
                    activeShops,
                    totalUsers,
                    totalProducts,
                    recentShops,
                    platformTrend
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async getShopUsers(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can view shop users",
                });
            }

            const users = await User.find({ shopId: req.params.id }).sort({ role: 1, name: 1 });
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                count: users.length,
                data: users,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAnalyticsData(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can view platform analytics",
                });
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const loginStats = await require('../models/AuditLog').aggregate([
                { $match: { action: 'LOGIN_SUCCESS', createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            const userDistribution = await User.aggregate([
                { $match: { role: { $ne: 'super_admin' } } },
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            sixMonthsAgo.setHours(0, 0, 0, 0);

            const userGrowthRaw = await User.aggregate([
                { $match: { role: { $ne: 'super_admin' }, createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedGrowth = [];
            for (let i = 0; i < 6; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                const m = date.getMonth() + 1;
                const y = date.getFullYear();
                const count = userGrowthRaw.find(t => t._id.month === m && t._id.year === y)?.count || 0;
                formattedGrowth.push({ month: months[date.getMonth()], users: count });
            }

            const stockHealth = {
                inStock: await Product.countDocuments({ isDeleted: false, inStock: true }),
                outOfStock: await Product.countDocuments({ isDeleted: false, inStock: false }),
            };

            const shopProductDistribution = await Product.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: "$shopId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                {
                    $lookup: {
                        from: "shops",
                        localField: "_id",
                        foreignField: "_id",
                        as: "shop"
                    }
                },
                { $unwind: "$shop" },   
                {
                    $project: {
                        name: "$shop.name",
                        count: 1
                    }
                }
            ]);

            const categoryDistribution = await Product.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "cat"
                    }
                },
                { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: { $ifNull: ["$cat.name", "Uncategorised"] },
                        count: 1
                    }
                }
            ]);

            const priceRangeDistribution = await Product.aggregate([
                { $match: { isDeleted: false } },
                {
                    $bucket: {
                        groupBy: "$price",
                        boundaries: [0, 500, 1000, 2500, 5000, 10000, 25000, 50000],
                        default: "50000+",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]);

            const priceLabels = ["₹0–500", "₹500–1K", "₹1K–2.5K", "₹2.5K–5K", "₹5K–10K", "₹10K–25K", "₹25K–50K", "₹50K+"];
            const formattedPriceDistribution = priceRangeDistribution.map((b, i) => ({
                name: priceLabels[i] || "₹50K+",
                count: b.count
            }));

            const shopTrendRaw = await Shop.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
            const productTrendRaw = await Product.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo }, isDeleted: false } },
                { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
            const platformTrend = [];
            for (let i = 0; i < 6; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                const m = date.getMonth() + 1;
                const y = date.getFullYear();
                platformTrend.push({
                    month: months[date.getMonth()],
                    shops: shopTrendRaw.find(t => t._id.month === m && t._id.year === y)?.count || 0,
                    products: productTrendRaw.find(t => t._id.month === m && t._id.year === y)?.count || 0,
                });
            }

            const totalShops = await Shop.countDocuments();
            const activeShops = await Shop.countDocuments({ isActive: true });
            const totalUsers = await User.countDocuments({ role: { $ne: 'super_admin' } });
            const totalProducts = await Product.countDocuments({ isDeleted: false });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: {
                    loginStats,
                    userDistribution,
                    userGrowth: formattedGrowth,
                    stockHealth,
                    shopProductDistribution,
                    categoryDistribution,
                    priceRangeDistribution: formattedPriceDistribution,
                    platformTrend,
                    summary: { totalShops, activeShops, totalUsers, totalProducts },
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async getShopInventory(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can view shop inventory",
                });
            }

            const products = await Product.find({ shopId: req.params.id, isDeleted: false })
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort({ createdAt: -1 });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                count: products.length,
                data: products,
            });
        } catch (err) {
            next(err);
        }
    }

    async deleteShop(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(statusCodes.FORBIDDEN).json({
                    status: false,
                    message: "Only super administrators can delete shops",
                });
            }

            const shopId = req.params.id;
            const shop = await Shop.findById(shopId);

            if (!shop) {
                return res.status(statusCodes.NOT_FOUND).json({
                    status: false,
                    message: "Shop not found",
                });
            }

            await Product.deleteMany({ shopId });
            await User.deleteMany({ shopId });
            await Shop.findByIdAndDelete(shopId);

            emitToSuperAdmin('shopDeleted', { id: shopId });

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: "Shop and all associated data deleted permanently",
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AdminController();

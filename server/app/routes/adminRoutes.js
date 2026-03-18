const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const { protect } = require('../middleware/auth');

router.get('/shops', protect, adminController.getAllShops);
router.get('/shops/:id/users', protect, adminController.getShopUsers);
router.get('/shops/:id/inventory', protect, adminController.getShopInventory);
router.patch('/shops/:id/toggle', protect, adminController.toggleShopStatus);
router.get('/metrics', protect, adminController.getPlatformMetrics);
router.get('/analytics', protect, adminController.getAnalyticsData);
router.delete('/shops/:id', protect, adminController.deleteShop);

module.exports = router;

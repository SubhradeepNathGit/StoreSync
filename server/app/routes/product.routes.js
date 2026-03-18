const express = require("express");
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    forceDeleteProduct,
    importCsvProducts,
    bulkDeleteProducts,
    getShopMetrics
} = require("../controllers/ProductController");

const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const upload = require("../middleware/upload");
const csvUpload = require("../middleware/csvUpload");

const { validateRequest, productSchema } = require("../middleware/joiValidator");

const router = express.Router();

router.get("/", protect, checkPermission("read_product"), getProducts);

router.get("/metrics/stats", protect, checkPermission("read_product"), getShopMetrics);

router.get("/:id", protect, checkPermission("read_product"), getProduct);


router.post("/", protect, checkPermission("create_product"), upload.single("image"), validateRequest(productSchema), createProduct);

router.post("/import", protect, checkPermission("create_product"), csvUpload.single("csvFile"), importCsvProducts);

router.put("/:id", protect, checkPermission("update_product"), upload.single("image"), validateRequest(productSchema), updateProduct);

router.delete("/:id", protect, checkPermission("delete_product"), deleteProduct);
router.put("/:id/restore", protect, checkPermission("update_product"), restoreProduct);
router.delete("/:id/force", protect, checkPermission("delete_product"), forceDeleteProduct);
router.delete("/bulk/delete-all", protect, checkPermission("delete_product"), bulkDeleteProducts);

module.exports = router;

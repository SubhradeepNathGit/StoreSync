const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
    getCategories,
    getSubcategories,
    getAllCategoriesWithSubcategories,
    deleteCategory,
    deleteSubcategory,
    createCategory,
    createSubcategory
} = require("../controllers/CategoryController");

router.get("/", protect, getCategories);
router.get("/all", protect, getAllCategoriesWithSubcategories);
router.get("/:categoryId/subcategories", protect, getSubcategories);
router.post("/", protect, createCategory);
router.post("/subcategories", protect, createSubcategory);
router.delete("/:categoryId", protect, deleteCategory);
router.delete("/subcategories/:subcategoryId", protect, deleteSubcategory);

module.exports = router;

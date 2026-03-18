const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const employeeRoutes = require("./employee.routes");
const taskRoutes = require("./task.routes");

const categoryRoutes = require("./category.routes");

// health check
router.get("/", (req, res) => {
    res.json({
        status: true,
        message: "E-Commerce APIs are running successfully",
    });
});


router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/products", productRoutes);
router.use("/api/employees", employeeRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/tasks", taskRoutes);

module.exports = router;

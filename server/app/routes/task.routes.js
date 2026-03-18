const express = require("express");
const router = express.Router();
const taskController = require("../controllers/TaskController");
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");


router.use(protect);

router.get(
    "/platform-metrics",
    checkPermission("view_platform_metrics"),
    taskController.getPlatformTaskMetrics
);

router.get("/unread-count", taskController.getUnreadCount);

router
    .route("/")
    .post(checkPermission("create_task"), taskController.createTask)
    .get(taskController.getTasks);

router.patch("/:id/read", taskController.markAsRead);

router
    .route("/:id")
    .get(taskController.getTaskById)
    .patch(taskController.updateTask)
    .delete(checkPermission("delete_task"), taskController.deleteTask);

module.exports = router;

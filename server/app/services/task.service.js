const Task = require("../models/Task");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { sendTaskAssignedEmail } = require("../utils/emailService");
const { emitToShop } = require("../utils/socket");

// create task with rbac
exports.createTask = async (taskData, userId, userRole, userShopId) => {
    
    const allowedRoles = ["super_admin", "owner", "manager"];
    if (!allowedRoles.includes(userRole)) {
        throw new ErrorResponse("Not authorized to create tasks", 403);
    }

    const isPlatformAdmin = userRole === "super_admin";
    const shopId = isPlatformAdmin ? (taskData.shopId || userShopId) : userShopId;

    if (!isPlatformAdmin && !shopId) {
        throw new ErrorResponse("Shop association required to create tasks", 400);
    }

    const task = await Task.create({
        ...taskData,
        assignedBy: userId,
        shopId: shopId
    });

    
    try {
        const assignee = await User.findById(taskData.assignedTo);
        const assigner = await User.findById(userId);
        if (assignee && assigner && assignee.email) {
            await sendTaskAssignedEmail({
                to: assignee.email,
                userName: assignee.name,
                taskTitle: task.title,
                dueDate: task.dueDate,
                assignedBy: assigner.role === 'owner' ? 'Owner' : assigner.name
            });
        }
    } catch (emailError) {
        console.error("Error sending task assignment email:", emailError);
        // silent fail for email
    }

    emitToShop(task.shopId, 'taskCreated', task);

    return task;
};

// get tasks with filters
exports.getTasks = async (query, userId, userRole, userShopId) => {
    const {
        page = 1,
        limit = 10,
        status = "",
        priority = "",
        search = "",
        shopId = "",
    } = query;

    const findQuery = { isDeleted: false };

    
    const isPlatformAdmin = userRole === "super_admin";

    if (userRole === "employee") {
        findQuery.assignedTo = userId;
    } else if (isPlatformAdmin) {
        
        
        if (shopId) findQuery.shopId = shopId;
    } else {
        
        findQuery.shopId = userShopId;
    }

    if (status) findQuery.status = status;
    if (priority) findQuery.priority = priority;
    if (search) {
        findQuery.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    const tasks = await Task.find(findQuery)
        .populate("assignedBy", "name email role")
        .populate("assignedTo", "name email role")
        .populate(isPlatformAdmin ? { path: "shopId", select: "name" } : [])
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Task.countDocuments(findQuery);

    return {
        tasks,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
};

// get task by id
exports.getTaskById = async (taskId, userId, userRole, userShopId) => {
    const task = await Task.findById(taskId)
        .populate("assignedBy", "name email role")
        .populate("assignedTo", "name email role");

    if (!task || task.isDeleted) {
        throw new ErrorResponse("Task not found", 404);
    }

    
    const isSuperOrAdmin = userRole === "super_admin";
    if (!isSuperOrAdmin) {
        if (userRole === "manager" && task.shopId.toString() !== userShopId.toString()) {
            throw new ErrorResponse("Not authorized to view tasks in another shop", 403);
        }
        if (userRole === "owner" && task.shopId.toString() !== userShopId.toString()) {
            throw new ErrorResponse("Not authorized to view tasks in another shop", 403);
        }
        if (userRole === "employee" && task.assignedTo.toString() !== userId) {
            throw new ErrorResponse("Not authorized to view this task", 403);
        }
    }

    return task;
};

// update task
exports.updateTask = async (taskId, updateData, userId, userRole, userShopId) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ErrorResponse("Task not found", 404);
    }

    const isSuperOrAdmin = userRole === "super_admin";

    if (userRole === "employee") {
        
        if (task.assignedTo.toString() !== userId) {
            throw new ErrorResponse("Not authorized to update this task", 403);
        }
        
        
        const allowedUpdates = ["status"];
        const actualUpdates = Object.keys(updateData);
        const isUnauthorizedUpdate = actualUpdates.some(key => !allowedUpdates.includes(key));
        
        if (isUnauthorizedUpdate) {
            throw new ErrorResponse("Employees can only update task status", 403);
        }

        
        if (updateData.status && !['Completed', 'Pending'].includes(updateData.status)) {
            throw new ErrorResponse("Invalid status update", 400);
        }
    } else if (userRole === "manager" || userRole === "owner") {
        
        if (task.shopId.toString() !== userShopId.toString()) {
            throw new ErrorResponse("Not authorized to update tasks in another shop", 403);
        }
    } else if (!isSuperOrAdmin) {
        throw new ErrorResponse("Not authorized to update tasks", 403);
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        runValidators: true,
    }).populate("assignedBy", "name email role")
      .populate("assignedTo", "name email role");

    emitToShop(updatedTask.shopId, 'taskUpdated', updatedTask);

    return updatedTask;
};

// soft delete task
exports.deleteTask = async (taskId, userId, userRole, userShopId) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ErrorResponse("Task not found", 404);
    }

    const isSuperOrAdmin = userRole === "super_admin";
    
    
    const isOwner = userRole === "owner";
    const isManager = userRole === "manager";

    if (!isSuperOrAdmin) {
        if ((isManager || isOwner) && task.shopId.toString() !== userShopId.toString()) {
             throw new ErrorResponse("Not authorized to delete tasks in another shop", 403);
        }
        if (!isManager && !isOwner) {
            throw new ErrorResponse("Not authorized to delete tasks", 403);
        }
    }

    task.isDeleted = true;
    task.deletedAt = Date.now();
    await task.save();

    emitToShop(task.shopId, 'taskDeleted', task._id);

    return { success: true, message: "Task deleted successfully" };
};

// platform task metrics
exports.getPlatformTaskMetrics = async () => {
    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const completedTasks = await Task.countDocuments({ isDeleted: false, status: "Completed" });
    const pendingTasks = await Task.countDocuments({ isDeleted: false, status: "Pending" });
    
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
        isDeleted: false,
        status: { $ne: "Completed" },
        dueDate: { $lt: now }
    });

    
    const shopMetrics = await Task.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: "$shopId",
                total: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                },
                overdue: {
                    $sum: {
                        $cond: [
                            { $and: [{ $lt: ["$dueDate", now] }, { $ne: ["$status", "Completed"] }] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: "shops",
                localField: "_id",
                foreignField: "_id",
                as: "shopInfo"
            }
        },
        { $unwind: "$shopInfo" },
        {
            $project: {
                name: "$shopInfo.name",
                total: 1,
                completed: 1,
                overdue: 1,
                efficiency: {
                    $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        { $multiply: [{ $divide: ["$completed", "$total"] }, 100] }
                    ]
                }
            }
        },
        { $sort: { efficiency: -1 } }
    ]);

    return {
        overview: {
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks
        },
        shopMetrics
    };
};
// mark task as read
exports.markTaskAsRead = async (taskId, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new ErrorResponse("Task not found", 404);

    if (task.assignedTo.toString() !== userId.toString()) {
        return task; 
    }

    let updated = false;
    if (!task.isReadByAssignee) {
        task.isReadByAssignee = true;
        updated = true;
    }

    if (updated) {
        await task.save();
        emitToShop(task.shopId, 'taskRead', { taskId, userId });
        emitToShop(task.shopId, 'taskUpdated', task); // Status changed
    }

    return task;
};

// get counts for badges (pending tasks)
exports.getUnreadTaskCount = async (userId, role, shopId) => {
    const baseQuery = { isDeleted: false };
    
    if (role === 'employee') {
        baseQuery.assignedTo = userId;
    } else if (role === 'owner' || role === 'manager') {
        baseQuery.shopId = shopId;
    }

    const pendingQuery = { ...baseQuery, status: "Pending" };
    const pendingCount = await Task.countDocuments(pendingQuery);

    return { pendingCount };
};

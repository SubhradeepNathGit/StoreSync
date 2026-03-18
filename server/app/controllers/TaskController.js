const taskService = require("../services/task.service");
const { statusCodes } = require("../helper/statusCode");

class TaskController {
    
    
    
    async createTask(req, res, next) {
        try {
            const task = await taskService.createTask(req.body, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.CREATED).json({
                status: true,
                success: true,
                data: task,
                message: "Task created successfully",
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getTasks(req, res, next) {
        try {
            const result = await taskService.getTasks(req.query, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                ...result,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getTaskById(req, res, next) {
        try {
            const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: task,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async updateTask(req, res, next) {
        try {
            const task = await taskService.updateTask(req.params.id, req.body, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: task,
                message: "Task updated successfully",
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async deleteTask(req, res, next) {
        try {
            const result = await taskService.deleteTask(req.params.id, req.user.id, req.user.role, req.user.shopId);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                ...result,
            });
        } catch (err) {
            next(err);
        }
    }

    
    
    
    async getPlatformTaskMetrics(req, res, next) {
        try {
            const metrics = await taskService.getPlatformTaskMetrics();
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: metrics,
            });
        } catch (err) {
            next(err);
        }
    }

    // mark task as read
    async markAsRead(req, res, next) {
        try {
            const task = await taskService.markTaskAsRead(req.params.id, req.user.id);
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: task,
                message: "Task marked as read",
            });
        } catch (err) {
            next(err);
        }
    }

    // get unread/pending count
    async getUnreadCount(req, res, next) {
        try {
            const { pendingCount } = await taskService.getUnreadTaskCount(
                req.user.id,
                req.user.role,
                req.user.shopId
            );
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                pendingCount
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new TaskController();

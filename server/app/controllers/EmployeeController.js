const employeeService = require('../services/employee.service');
const { statusCodes } = require("../helper/statusCode");

/**
 * @desc    Create new employee
 * @route   POST /api/employees
 * @access  Owner only
 */
class EmployeeController {
    async createEmployee(req, res) {
        try {
            const { name, email, role } = req.body;

            
            if (!name || !email) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    success: false,
                    message: 'Please provide name and email',
                });
            }

            
            if (role && !['employee', 'manager'].includes(role)) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    status: false,
                    success: false,
                    message: 'Invalid role. Must be employee or manager',
                });
            }

            const result = await employeeService.createEmployee(
                { name, email, role },
                req.user.id,
                req.user.shopId
            );

            const label = result.employee.role === 'manager' ? 'Manager' : 'Employee';
            res.status(statusCodes.CREATED).json({
                status: true,
                success: true,
                message: `${label} created successfully. Credentials sent to email.`,
                data: result.employee,
            });
        } catch (error) {
            console.error('Create employee error:', error);
            res.status(statusCodes.BAD_REQUEST).json({
                status: false,
                success: false,
                message: error.message || 'Failed to create employee',
            });
        }
    }

    /**
     * @desc    Get all employees
     * @route   GET /api/employees
     * @access  Owner only
     */
    async getEmployees(req, res) {
        try {
            const { role, isActive, search, page, limit } = req.query;

            const filters = {
                page,
                limit,
                role,
                search
            };
            if (isActive !== undefined) filters.isActive = isActive === 'true';

            const result = await employeeService.getEmployees(filters, req.user.shopId);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                ...result
            });
        } catch (error) {
            console.error('Get employees error:', error);
            res.status(statusCodes.SERVER_ERROR).json({
                status: false,
                success: false,
                message: 'Failed to fetch employees',
            });
        }
    }

    /**
     * @desc    Get employee by ID
     * @route   GET /api/employees/:id
     * @access  Owner only
     */
    async getEmployeeById(req, res) {
        try {
            const employee = await employeeService.getEmployeeById(req.params.id, req.user.shopId);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                data: employee,
            });
        } catch (error) {
            console.error('Get employee error:', error);
            res.status(statusCodes.NOT_FOUND).json({
                status: false,
                success: false,
                message: error.message || 'Employee not found',
            });
        }
    }

    /**
     * @desc Toggle employee active status
     * @route PATCH /api/employees/:id/toggle
     * @access  Owner only
     */
    async toggleEmployeeStatus(req, res) {
        try {
            const employee = await employeeService.toggleEmployeeStatus(req.params.id, req.user.shopId);

            const label = employee.role === 'manager' ? 'Manager' : 'Employee';
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: `${label} ${employee.isActive ? 'activated' : 'deactivated'} successfully`,
                data: employee,
            });
        } catch (error) {
            console.error('Toggle employee status error:', error);
            res.status(statusCodes.BAD_REQUEST).json({
                status: false,
                success: false,
                message: error.message || 'Failed to update employee status',
            });
        }
    }

    /**
     * @desc    Reset employee password
     * @route   POST /api/employees/:id/reset-password
     * @access  Owner only
     */
    async resetEmployeePassword(req, res) {
        try {
            const employee = await employeeService.getEmployeeById(req.params.id, req.user.shopId);
            const result = await employeeService.resetEmployeePassword(req.params.id, req.user.shopId);

            const label = employee.role === 'manager' ? 'Manager' : 'Employee';
            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: `Password reset successfully. New credentials sent to ${label.toLowerCase()} email.`,
                data: result,
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(statusCodes.BAD_REQUEST).json({
                status: false,
                success: false,
                message: error.message || 'Failed to reset password',
            });
        }
    }

    /**
     * @desc    Delete employee (deactivate)
     * @route   DELETE /api/employees/:id
     * @access  Owner only
     */
    async deleteEmployee(req, res) {
        try {
            const result = await employeeService.deleteEmployee(req.params.id, req.user.shopId);

            res.status(statusCodes.OK).json({
                status: true,
                success: true,
                message: result.message,
            });
        } catch (error) {
            console.error('Delete employee error:', error);
            res.status(statusCodes.BAD_REQUEST).json({
                status: false,
                success: false,
                message: error.message || 'Failed to delete employee',
            });
        }
    }
}

module.exports = new EmployeeController();

const User = require('../models/User');
const { generatePassword, generateEmployeeId } = require('../utils/passwordGenerator');
const { sendEmployeeWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { emitToShop, emitToSuperAdmin } = require('../utils/socket');

/**
 * Create a new employee
 * @param {Object} employeeData - Employee data
 * @param {string} adminId - ID of the admin creating the employee
 * @returns {Object} - Created employee and generated password
 */
exports.createEmployee = async (employeeData, adminId, shopId) => {
    const { name, email, role } = employeeData;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }

    
    const lastEmployee = await User.findOne({ employeeId: { $exists: true } })
        .sort({ employeeId: -1 })
        .select('employeeId');

    let nextIdNumber = 1;
    if (lastEmployee && lastEmployee.employeeId) {
        const lastIdMatch = lastEmployee.employeeId.match(/EMP(\d+)/);
        if (lastIdMatch) {
            nextIdNumber = parseInt(lastIdMatch[1], 10) + 1;
        }
    }

    
    const generateId = (num) => `EMP${String(num).padStart(3, '0')}`;
    const employeeId = generateId(nextIdNumber);

    
    const generatedPassword = generatePassword(12);

    
    const employee = await User.create({
        name,
        email,
        password: generatedPassword,
        role: role || 'employee',
        employeeId,
        isActive: true,
        isFirstLogin: true,
        createdBy: adminId,
        shopId: shopId,
        isVerified: true, 
    });

    emitToShop(shopId, 'employeeCreated', employee);
    emitToSuperAdmin('userCreated', employee);

    
    try {
        await sendEmployeeWelcomeEmail({
            to: email,
            name,
            employeeId,
            password: generatedPassword,
        });
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        
    }

    return {
        employee: {
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            employeeId: employee.employeeId,
            role: employee.role,
            isActive: employee.isActive,
            createdAt: employee.createdAt,
        },
        generatedPassword, 
    };
};

/**
 * Get all employees
 * @param {Object} filters - Filter options
 * @returns {Array} - List of employees
 */
exports.getEmployees = async (filters = {}, shopId) => {
    const { page = 1, limit = 10, role, isActive, search } = filters;
    
    // Base query: MUST belong to the shop
    const query = { shopId: shopId };

    // If a specific role is requested, use it. 
    // If no role is requested, default to showing only those with employeeId (actual employees/staff) 
    // to avoid showing the owner themselves or other non-staff users if any.
    if (role) {
        query.role = role;
    } else {
        query.employeeId = { $exists: true };
    }
    if (isActive !== undefined) {
        query.isActive = isActive;
    }
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
        ];
    }

    const totalEmployees = await User.countDocuments(query);
    const employees = await User.find(query)
        .select('-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    return {
        employees,
        totalPages: Math.ceil(totalEmployees / limit),
        currentPage: Number(page),
        totalEmployees
    };
};

/**
 * Get employee by ID
 * @param {string} employeeId - Employee ID
 * @param {string} shopId - ID of the shop
 * @returns {Object} - Employee details
 */
exports.getEmployeeById = async (employeeId, shopId) => {
    const employee = await User.findOne({ _id: employeeId, shopId: shopId })
        .select('-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire')
        .populate('createdBy', 'name email');

    if (!employee || (employee.role !== 'employee' && employee.role !== 'manager')) {
        throw new Error('Employee or Manager not found in this shop');
    }

    return employee;
};

/**
 * Toggle employee active status
 * @param {string} employeeId - Employee ID
 * @param {string} shopId - ID of the shop
 * @returns {Object} - Updated employee
 */
exports.toggleEmployeeStatus = async (employeeId, shopId) => {
    const employee = await User.findOne({ _id: employeeId, shopId: shopId });

    if (!employee || (employee.role !== 'employee' && employee.role !== 'manager')) {
        throw new Error('Employee or Manager not found in this shop');
    }

    employee.isActive = !employee.isActive;

    
    if (!employee.isActive) {
        employee.refreshToken = undefined;
    }

    await employee.save();

    emitToShop(shopId, 'employeeUpdated', employee);
    emitToSuperAdmin('userUpdated', employee);

    return {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        isActive: employee.isActive,
        role: employee.role,
    };
};

/**
 * Reset employee password
 * @param {string} employeeId - Employee ID
 * @param {string} shopId - ID of the shop
 * @returns {Object} - Success message
 */
exports.resetEmployeePassword = async (employeeId, shopId) => {
    const employee = await User.findOne({ _id: employeeId, shopId: shopId });

    if (!employee || (employee.role !== 'employee' && employee.role !== 'manager')) {
        throw new Error('Employee or Manager not found in this shop');
    }

    
    const newPassword = generatePassword(12);

    
    employee.password = newPassword;
    employee.isFirstLogin = true;
    employee.lastPasswordChange = new Date();
    await employee.save();

    
    try {
        await sendPasswordResetEmail({
            to: employee.email,
            name: employee.name,
            password: newPassword,
        });
    } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        
    }

    return {
        message: 'Password reset successfully',
        email: employee.email,
    };
};

/**
 * Delete employee (soft delete by deactivating)
 * @param {string} employeeId - Employee ID
 * @param {string} shopId - ID of the shop
 * @returns {Object} - Success message
 */
exports.deleteEmployee = async (employeeId, shopId) => {
    const employee = await User.findOne({ _id: employeeId, shopId: shopId });

    if (!employee || (employee.role !== 'employee' && employee.role !== 'manager')) {
        throw new Error('Employee or Manager not found in this shop');
    }

    if (employee.isActive) {
        throw new Error('Please deactivate the employee before deleting');
    }

    await User.findByIdAndDelete(employeeId);

    emitToShop(shopId, 'employeeDeleted', { id: employeeId });
    emitToSuperAdmin('userDeleted', { id: employeeId });

    return {
        message: 'Employee deleted from database successfully',
    };
};

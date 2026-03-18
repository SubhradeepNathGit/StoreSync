const express = require('express');
const router = express.Router();
const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    toggleEmployeeStatus,
    resetEmployeePassword,
    deleteEmployee,
} = require('../controllers/EmployeeController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');


router.use(protect);
router.use(checkRole('owner', 'manager')); 


router.post('/', createEmployee);


router.get('/', getEmployees);


router.get('/:id', getEmployeeById);


router.patch('/:id/toggle', toggleEmployeeStatus);


router.post('/:id/reset-password', resetEmployeePassword);


router.delete('/:id', deleteEmployee);

module.exports = router;

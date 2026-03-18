import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Mail, ToggleLeft, ToggleRight, Search, X, ClipboardList, Eye, Trash2 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import employeeApi from '../../api/employeeApi';
import { toast } from 'react-toastify';
import useSidebarStore from '../../store/useSidebarStore';
import TaskModal from '../../components/modals/TaskModal';
import * as taskApi from '../../api/taskApi';
import { useSocket } from '../../context/SocketContext';
import ProfileModal from '../../components/modals/ProfileModal';

const EmployeeManagement = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { isOpen } = useSidebarStore();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        role: 'employee'
    });
    const [submitting, setSubmitting] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState(null);

    const handleSaveTask = async (formData) => {
        try {
            await taskApi.createTask(formData);
            toast.success('Task assigned successfully!');
            setShowTaskModal(false);
            setSelectedEmployeeForTask(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign task');
            throw error;
        }
    };

    
    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'super_admin')) {
                navigate('/');
            }
        }
    }, [user, authLoading, navigate]);

    
    


    const fetchEmployees = async (search = '') => {
        try {
            setLoading(true);
            const response = await employeeApi.getEmployees({ search, role: 'employee' });
            setEmployees(response.employees || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to permanently delete this employee? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await employeeApi.deleteEmployee(employeeId);
            if (response.success) {
                toast.success(response.message || 'Employee deleted successfully');
                fetchEmployees(searchTerm); 
            }
        } catch (error) {
            console.error('Delete employee error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        }
    };

    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (user && (user.role === 'owner' || user.role === 'manager')) {
                fetchEmployees(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, user]);

    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleStaffChange = () => {
            fetchEmployees(searchTerm);
        };

        socket.on('employeeCreated', handleStaffChange);
        socket.on('employeeUpdated', handleStaffChange);
        socket.on('employeeDeleted', handleStaffChange);

        return () => {
            socket.off('employeeCreated', handleStaffChange);
            socket.off('employeeUpdated', handleStaffChange);
            socket.off('employeeDeleted', handleStaffChange);
        };
    }, [socket, searchTerm]);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await employeeApi.createEmployee(newEmployee);
            toast.success(response.message || `Employee created! Credentials sent to ${newEmployee.email}`);
            setShowAddModal(false);
            setNewEmployee({ name: '', email: '', role: 'employee' });
            fetchEmployees();
        } catch (error) {
            console.error('Create employee error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create employee';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (employeeId, currentStatus) => {
        try {
            const response = await employeeApi.toggleEmployeeStatus(employeeId);
            setEmployees(prev => prev.map(emp =>
                emp._id === employeeId ? { ...emp, isActive: !currentStatus } : emp
            ));
            toast.success(response.message || `Employee ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        } catch {
            toast.error('Failed to update employee status');
        }
    };

    const activeCount = employees.filter(e => e.isActive).length;
    const inactiveCount = employees.filter(e => !e.isActive).length;



    return (
        <div className="flex min-h-screen bg-slate-50">
            {}
            <Sidebar selectedCategory="" selectedSubcategory="" onFilterChange={() => { }} />

            {}
            <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                <div className="pt-[72px] lg:pt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

                        {}
                        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operations</span>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    Employee <span className="text-slate-400 font-normal">Management</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-base mt-1">Manage employee accounts and permissions</p>
                            </div>
                            {(user?.role === 'owner') && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all duration-200 font-semibold text-sm shadow-sm active:scale-95"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add New Employee
                                </button>
                            )}
                        </div>

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Employees</p>
                                <p className="text-3xl font-bold text-slate-900">{employees.length}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Active</p>
                                <p className="text-3xl font-bold text-slate-900">{activeCount}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Inactive</p>
                                <p className="text-3xl font-bold text-slate-900">{inactiveCount}</p>
                            </div>
                        </div>

                        {}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or employee ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 bg-white"
                                />
                            </div>
                        </div>

                        {}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="mt-5 text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Loading Employees...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added By</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {employees.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                                                <Users className="w-7 h-7 text-slate-300" />
                                                            </div>
                                                            <p className="text-slate-500 font-medium text-sm">No employees found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                employees.map((employee) => (
                                                    <tr key={employee._id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                    {employee.profileImage && employee.profileImage !== "no-photo.jpg" ? (
                                                                        <img
                                                                            src={employee.profileImage.startsWith("http") ? employee.profileImage : `http://localhost:3006/${employee.profileImage}`}
                                                                            alt={employee.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-slate-600 font-bold text-sm">
                                                                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 text-sm">{employee.name}</p>
                                                                    <p className="text-xs text-slate-500">{employee.email}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{employee.employeeId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {user?.role === 'owner' ? (
                                                                <button
                                                                    onClick={() => handleToggleStatus(employee._id, employee.isActive)}
                                                                    className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 transition-all shadow-sm active:scale-95 ${employee.isActive
                                                                        ? 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100'
                                                                        : 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
                                                                        }`}
                                                                >
                                                                    <div className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                                                        {employee.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 shadow-sm inline-flex ${employee.isActive
                                                                        ? 'bg-green-50 border-green-100 text-green-700'
                                                                        : 'bg-red-50 border-red-100 text-red-700'
                                                                        }`}
                                                                >
                                                                    <div className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                                                        {employee.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {employee.createdBy ? (
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-800">{employee.createdBy.name}</p>
                                                                    <p className="text-xs text-slate-400">{employee.createdBy.email}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">System</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                            {new Date(employee.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {employee.joinedAt ? (
                                                                <span className="text-sm text-slate-500 font-medium">
                                                                    {new Date(employee.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 font-medium italic">
                                                                    Not joined yet
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedEmployeeForProfile(employee);
                                                                        setShowProfileModal(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    View Profile
                                                                </button>

                                                                {(user?.role === 'owner' || user?.role === 'manager') && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedEmployeeForTask({
                                                                                _id: employee._id,
                                                                                name: employee.name,
                                                                                role: employee.role || 'employee'
                                                                            });
                                                                            setShowTaskModal(true);
                                                                        }}
                                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        <ClipboardList className="w-3.5 h-3.5" />
                                                                        Assign Task
                                                                    </button>
                                                                )}

                                                                {!employee.isActive && (user?.role === 'owner') && (
                                                                    <button
                                                                        onClick={() => handleDeleteEmployee(employee._id)}
                                                                        className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                        title="Delete Employee"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>

            {}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Add New Employee</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Credentials will be sent via email</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddEmployee} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newEmployee.name}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={newEmployee.email}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400"
                                        placeholder="john@company.com"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
                                <p className="text-sm text-slate-600">
                                    <strong className="text-slate-800">Note:</strong> Login credentials will be auto-generated and sent to the employee's email address.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {submitting ? 'Creating...' : 'Create Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <TaskModal
                isOpen={showTaskModal}
                onClose={() => {
                    setShowTaskModal(false);
                    setSelectedEmployeeForTask(null);
                }}
                task={null}
                onSave={handleSaveTask}
                user={user}
                preSelectedAssignee={selectedEmployeeForTask}
            />

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => {
                    setShowProfileModal(false);
                    setSelectedEmployeeForProfile(null);
                }}
                viewUser={selectedEmployeeForProfile}
            />
        </div>
    );
};

export default EmployeeManagement;

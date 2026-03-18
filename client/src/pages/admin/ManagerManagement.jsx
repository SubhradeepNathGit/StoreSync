import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, ClipboardList, Eye, Trash2 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import employeeApi from '../../api/employeeApi';
import { toast } from 'react-toastify';
import useSidebarStore from '../../store/useSidebarStore';
import TaskModal from '../../components/modals/TaskModal';
import { useSocket } from '../../context/SocketContext';
import * as taskApi from '../../api/taskApi';
import ProfileModal from '../../components/modals/ProfileModal';

const ManagerManagement = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { isOpen } = useSidebarStore();
    const navigate = useNavigate();
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedManagerForTask, setSelectedManagerForTask] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedManagerForProfile, setSelectedManagerForProfile] = useState(null);

    const handleSaveTask = async (formData) => {
        try {
            await taskApi.createTask(formData);
            toast.success('Task assigned successfully!');
            setShowTaskModal(false);
            setSelectedManagerForTask(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign task');
            throw error;
        }
    };

    
    useEffect(() => {
        if (!authLoading) {
            if (!user || !['owner', 'super_admin'].includes(user.role)) {
                navigate('/');
            }
        }
    }, [user, authLoading, navigate]);

    const fetchManagers = async (search = '') => {
        try {
            setLoading(true);
            const response = await employeeApi.getEmployees({ search, role: 'manager' });
            setManagers(response.employees || response.data || []);
        } catch (error) {
            console.error('Error fetching managers:', error);
            toast.error('Failed to load managers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (user && ['owner', 'super_admin'].includes(user.role)) {
                fetchManagers(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, user]);

    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleStaffChange = () => {
            fetchManagers(searchTerm);
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

    const handleToggleStatus = async (managerId, currentStatus) => {
        try {
            const response = await employeeApi.toggleEmployeeStatus(managerId);
            setManagers(prev => prev.map(m =>
                m._id === managerId ? { ...m, isActive: !currentStatus } : m
            ));
            toast.success(response.message || `Manager ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        } catch {
            toast.error('Failed to update manager status');
        }
    };

    const handleDeleteManager = async (managerId) => {
        if (!window.confirm('Are you sure you want to permanently delete this manager? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await employeeApi.deleteEmployee(managerId);
            if (response.success) {
                toast.success(response.message || 'Manager deleted successfully');
                fetchManagers(searchTerm); 
            }
        } catch (error) {
            console.error('Delete manager error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete manager');
        }
    };

    const activeCount = managers.filter(m => m.isActive).length;
    const inactiveCount = managers.length - activeCount;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar selectedCategory="" selectedSubcategory="" onFilterChange={() => { }} />

            <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                <div className="pt-[72px] lg:pt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

                            <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operations</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                        Manager <span className="text-slate-400 font-normal">Management</span>
                                    </h1>
                                    <p className="text-slate-500 font-medium text-base mt-1">Direct oversight of shop management personnel</p>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Managers</p>
                                <p className="text-3xl font-bold text-slate-900">{managers.length}</p>
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

                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search managers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-slate-400 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 bg-white"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="mt-5 text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Syncing Management...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manager</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added By</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {managers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                                                <ShieldCheck className="w-7 h-7 text-slate-300" />
                                                            </div>
                                                            <p className="text-slate-500 font-medium text-sm">No managers registered</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                managers.map((manager) => (
                                                    <tr key={manager._id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                    {manager.profileImage && manager.profileImage !== "no-photo.jpg" ? (
                                                                        <img
                                                                            src={manager.profileImage.startsWith("http") ? manager.profileImage : `http://localhost:3006/${manager.profileImage}`}
                                                                            alt={manager.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-slate-600 font-bold text-sm">
                                                                            {manager.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 text-sm">{manager.name}</p>
                                                                    <p className="text-xs text-slate-500">{manager.email}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{manager.employeeId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                             <button
                                                                onClick={() => handleToggleStatus(manager._id, manager.isActive)}
                                                                className={`flex items-center justify-center gap-2.5 font-bold text-[10px] uppercase tracking-wider transition-all duration-150 active:scale-95 ${manager.isActive
                                                                    ? 'text-emerald-600'
                                                                    : 'text-red-700'
                                                                    }`}
                                                            >
                                                                <div className={`w-2 h-2 rounded-full ${manager.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                                <span>
                                                                    {manager.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {manager.createdBy ? (
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-800">{manager.createdBy.name}</p>
                                                                    <p className="text-xs text-slate-400">{manager.createdBy.email}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">Self Registered</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                            {new Date(manager.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                            {manager.joinedAt ? new Date(manager.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not joined yet'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center gap-2 justify-end">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedManagerForProfile(manager);
                                                                                setShowProfileModal(true);
                                                                            }}
                                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
                                                                        >
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                            View Profile
                                                                        </button>
                                                                        {user?.role === 'owner' && (
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedManagerForTask({
                                                                                            _id: manager._id,
                                                                                            name: manager.name,
                                                                                            role: manager.role || 'manager'
                                                                                        });
                                                                                        setShowTaskModal(true);
                                                                                    }}
                                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                                                                                >
                                                                                    <ClipboardList className="w-3.5 h-3.5" />
                                                                                    Assign Task
                                                                                </button>

                                                                                {!manager.isActive && (
                                                                                    <button
                                                                                        onClick={() => handleDeleteManager(manager._id)}
                                                                                        className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                                        title="Delete Manager"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
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
            <TaskModal
                isOpen={showTaskModal}
                onClose={() => {
                    setShowTaskModal(false);
                    setSelectedManagerForTask(null);
                }}
                task={null}
                onSave={handleSaveTask}
                user={user}
                preSelectedAssignee={selectedManagerForTask}
            />

            {}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => {
                    setShowProfileModal(false);
                    setSelectedManagerForProfile(null);
                }}
                viewUser={selectedManagerForProfile}
            />

        </div>
    );
};

export default ManagerManagement;

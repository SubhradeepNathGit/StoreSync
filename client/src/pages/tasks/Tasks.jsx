import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    ClipboardList, Plus, Search,
    Clock, CheckCircle, AlertCircle, Trash2, Edit2,
    ChevronDown, Check, Eye, X, Calendar, User, XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/layout/Sidebar';
import AuthContext from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useSidebarStore from '../../store/useSidebarStore';
import * as taskApi from '../../api/taskApi';
import TaskModal from '../../components/modals/TaskModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import * as adminApi from '../../api/adminApi';
import {
    LayoutDashboard, Store, TrendingUp,
    ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';


const TaskDetailModal = ({ task, onClose, user, onMarkAsCompleted, onTasksRefresh }) => {
    if (!task) return null;

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
    const displayStatus = isOverdue ? 'Overdue' : task.status;

    const statusStyles = {
        Completed: 'text-emerald-600',
        Pending: 'text-amber-600',
        Overdue: 'text-red-600',
    };
    const priorityStyles = {
        High: { text: 'text-red-600', dot: 'bg-red-500' },
        Medium: { text: 'text-amber-600', dot: 'bg-amber-500' },
        Low: { text: 'text-blue-600', dot: 'bg-blue-500' },
    };


    const Row = ({ label, value }) => (
        <div className="flex items-start py-3.5 border-b border-slate-50 last:border-0">
            <span className="w-36 text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-0.5">{label}</span>
            <span className="flex-1 text-sm font-semibold text-slate-800">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Task Details</p>
                        <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
                    </div>
                </div>

                <div className="px-6 pb-4 flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priorityStyles[task.priority].dot}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${priorityStyles[task.priority].text}`}>
                            {task.priority} Priority
                        </span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${statusStyles[displayStatus] || 'text-slate-500'}`}>
                        {displayStatus}
                    </span>
                </div>

                <div className="mx-6 border-t border-slate-100" />

                <div className="px-6 py-2">
                    {task.description && (
                        <div className="py-3.5 border-b border-slate-50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Description</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{task.description}</p>
                        </div>
                    )}
                    <Row 
                        label="Assigned To" 
                        value={['super_admin'].includes(user?.role) 
                            ? (task.assignedTo?.role ? task.assignedTo.role.charAt(0).toUpperCase() + task.assignedTo.role.slice(1) : 'Unknown') 
                            : (task.assignedTo?.name || 'Unknown')} 
                    />
                    <Row 
                        label="Assigned By" 
                        value={['super_admin'].includes(user?.role)
                            ? (task.assignedBy?.role ? task.assignedBy.role.charAt(0).toUpperCase() + task.assignedBy.role.slice(1) : 'System')
                            : (task.assignedBy?.role === 'owner' ? 'Owner' : (task.assignedBy?.name || 'Unknown'))} 
                    />
                    <Row label="Due Date" value={new Date(task.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
                </div>

                <div className="px-6 pb-6 pt-2">
                    {task.assignedTo?._id === (user?.id || user?._id) ? (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    onMarkAsCompleted(task._id, task.status);
                                    onClose();
                                }}
                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${task.status === 'Completed'
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    }`}
                            >
                                {task.status === 'Completed' ? (
                                    <>
                                        <AlertCircle className="w-5 h-5" />
                                        Undo Submit
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Mark as Complete
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const Tasks = () => {
    const { user } = useContext(AuthContext);
    const { isOpen } = useSidebarStore();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
    const [viewTask, setViewTask] = useState(null);

    
    const [platformMetrics, setPlatformMetrics] = useState(null);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
    const [showOverview, setShowOverview] = useState(true);
    const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

    const isPlatformAdmin = ['super_admin'].includes(user?.role);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                status: statusFilter,
                priority: priorityFilter
            };
            if (isPlatformAdmin && selectedShop) {
                params.shopId = selectedShop;
            }
            const response = await taskApi.getTasks(params);
            setTasks(response.tasks || []);
        } catch {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, priorityFilter, selectedShop, isPlatformAdmin]);

    const fetchPlatformData = useCallback(async () => {
        if (!isPlatformAdmin) return;
        try {
            const [metricsRes, shopsRes] = await Promise.all([
                taskApi.getPlatformTaskMetrics(),
                adminApi.getAllShops()
            ]);
            setPlatformMetrics(metricsRes.data);
            setShops(shopsRes.data || shopsRes.shops || []);
        } catch (error) {
            console.error('Error fetching platform data:', error);
        }
    }, [isPlatformAdmin]);

    useEffect(() => {
        const timer = setTimeout(fetchTasks, 300);
        return () => clearTimeout(timer);
    }, [fetchTasks]);

    useEffect(() => {
        if (isPlatformAdmin) {
            fetchPlatformData();
        }
    }, [fetchPlatformData, isPlatformAdmin]);

    const socket = useSocket();
    useEffect(() => {
        if (!socket || !user) return;

        const handleTaskCreated = (t) => {
            if (user.role === 'employee') {
                const assignedToId = t.assignedTo?._id || t.assignedTo;
                if (assignedToId !== user.id && assignedToId !== user._id) return;
            }
            
            if (isPlatformAdmin && selectedShop) {
                const taskShopId = t.shopId?._id || t.shopId;
                if (taskShopId !== selectedShop) return;
            }

            setTasks(prev => prev.find(x => x._id === t._id) ? prev : [t, ...prev]);
            if (isPlatformAdmin) fetchPlatformData();
        };

        const handleTaskUpdated = (t) => {
            if (user.role === 'employee') {
                const assignedToId = t.assignedTo?._id || t.assignedTo;
                if (assignedToId !== user.id && assignedToId !== user._id) {
                    setTasks(prev => prev.filter(x => x._id !== t._id));
                    return;
                }
            }

            if (isPlatformAdmin && selectedShop) {
                const taskShopId = t.shopId?._id || t.shopId;
                if (taskShopId !== selectedShop) {
                    setTasks(prev => prev.filter(x => x._id !== t._id));
                    return;
                }
            }

            setTasks(prev => prev.map(x => x._id === t._id ? t : x));
            if (isPlatformAdmin) fetchPlatformData();
        };

        const handleTaskDeleted = (id) => {
            setTasks(prev => prev.filter(x => x._id !== id));
            if (isPlatformAdmin) fetchPlatformData();
        };

        socket.on('taskCreated', handleTaskCreated);
        socket.on('taskUpdated', handleTaskUpdated);
        socket.on('taskDeleted', handleTaskDeleted);

        return () => {
            socket.off('taskCreated', handleTaskCreated);
            socket.off('taskUpdated', handleTaskUpdated);
            socket.off('taskDeleted', handleTaskDeleted);
        };
    }, [socket, user]);

    const handleSaveTask = async (formData) => {
        try {
            if (selectedTask) {
                await taskApi.updateTask(selectedTask._id, formData);
                toast.success('Task updated successfully');
            } else {
                await taskApi.createTask(formData);
                toast.success('Task created successfully');
            }
            fetchTasks();
            if (isPlatformAdmin) fetchPlatformData();
            setShowTaskModal(false);
            setSelectedTask(null);
            setSidebarRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save task');
            throw error;
        }
    };

    const handleDeleteTask = async () => {
        try {
            await taskApi.deleteTask(taskToDelete._id);
            toast.success('Task deleted successfully');
            fetchTasks();
            if (isPlatformAdmin) fetchPlatformData();
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
            setSidebarRefreshTrigger(prev => prev + 1);
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const handleMarkCompleted = async (taskId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
            await taskApi.updateTask(taskId, { status: newStatus });
            
            // Also mark as read if it was unread
            await taskApi.markAsRead(taskId);
            
            toast.success(newStatus === 'Completed' ? 'Task marked as completed!' : 'Task reverted to Pending');
            fetchTasks();
            if (isPlatformAdmin) fetchPlatformData();
            setSidebarRefreshTrigger(prev => prev + 1);
        } catch {
            toast.error('Failed to update task status');
        }
    };

    const getStatusInfo = (task) => {
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
        const displayStatus = isOverdue ? 'Overdue' : task.status;
        switch (displayStatus) {
            case 'Completed': return { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'Overdue': return { icon: <XCircle className="w-3.5 h-3.5" />, label: 'Overdue', color: 'text-red-600', bg: 'bg-red-50' };
            case 'Pending': 
            case 'In Progress':
            default: return { icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' };
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return { text: 'text-red-600', dot: 'bg-red-500' };
            case 'Medium': return { text: 'text-amber-600', dot: 'bg-amber-500' };
            case 'Low': return { text: 'text-blue-600', dot: 'bg-blue-500' };
            default: return { text: 'text-slate-600', dot: 'bg-slate-400' };
        }
    };

    const isManagerOrOwner = ['owner', 'manager'].includes(user?.role);

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
            <Sidebar selectedCategory="" selectedSubcategory="" onFilterChange={() => { }} refreshTrigger={sidebarRefreshTrigger} />

            <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                <div className="pt-[72px] lg:pt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

                        {}
                        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operation Center</span>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    Task <span className="text-slate-400 font-normal">{isPlatformAdmin ? 'Overview' : 'Management'}</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-base mt-1">
                                    {isPlatformAdmin ? 'Platform-wide oversight of shop tasks and performance' : 'Track progress and manage team assignments'}
                                </p>
                            </div>
                        </div>

                        {}
                        {isPlatformAdmin && platformMetrics && (
                            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 leading-tight">Platform Metrics</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time stats across all shops</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowOverview(!showOverview)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                                    >
                                        {showOverview ? 'Hide Overview' : 'Show Overview'}
                                    </button>
                                </div>

                                {showOverview && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                            {[
                                                { label: 'Total Tasks', value: platformMetrics.overview.totalTasks, icon: <ClipboardList className="w-4 h-4" />, color: 'bg-slate-900' },
                                                { label: 'Completed', value: platformMetrics.overview.completedTasks, icon: <CheckCircle className="w-4 h-4" />, color: 'bg-emerald-600' },
                                                { label: 'Pending', value: platformMetrics.overview.pendingTasks, icon: <AlertCircle className="w-4 h-4" />, color: 'bg-amber-500' },
                                                { label: 'Overdue', value: platformMetrics.overview.overdueTasks, icon: <ArrowUpRight className="w-4 h-4" />, color: 'bg-red-600', isAlert: platformMetrics.overview.overdueTasks > 0 }
                                            ].map((stat, i) => (
                                                <div key={i} className={`bg-white p-5 rounded-2xl border ${stat.isAlert ? 'border-red-100 bg-red-50/30' : 'border-slate-200'} shadow-sm group hover:shadow-md transition-all duration-300`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`p-2 rounded-xl ${stat.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                                            {stat.icon}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                                    <p className={`text-2xl font-bold ${stat.isAlert ? 'text-red-600' : 'text-slate-900'}`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
                                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-4 h-4 text-slate-400" />
                                                    <h3 className="text-sm font-bold text-slate-900">Shop Performance breakdown</h3>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency Ranking</span>
                                                </div>
                                            </div>
                                            <div>
                                                <table className="w-full">
                                                    <thead className="bg-slate-50/30 border-b border-slate-100">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shop Name</th>
                                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Load</th>
                                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compl.</th>
                                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest text-red-500">Overdue</th>
                                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</th>
                                                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {platformMetrics.shopMetrics.map((shop, idx) => (
                                                            <tr key={shop._id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-900 text-xs">
                                                                            {shop.name.charAt(0)}
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-slate-800">{shop.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-slate-600 text-sm">{shop.total}</td>
                                                                <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{shop.completed}</td>
                                                                <td className="px-6 py-4 font-bold text-red-500 text-sm">{shop.overdue}</td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full transition-all duration-1000 ${shop.efficiency > 70 ? 'bg-emerald-500' : shop.efficiency > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                                style={{ width: `${shop.efficiency}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs font-bold text-slate-800">{Math.round(shop.efficiency)}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${shop.efficiency > 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                        {shop.efficiency > 70 ? 'Healthy' : 'Needs Focus'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {}
                        <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl focus:border-slate-400 transition-all outline-none text-slate-900 text-sm font-semibold placeholder-slate-400"
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                {}
                                {isPlatformAdmin && (
                                    <div className="relative">
                                        <button onClick={() => setShopDropdownOpen(!shopDropdownOpen)} className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white border-transparent shadow-sm rounded-xl text-xs font-bold outline-none cursor-pointer min-w-[160px] transition-all hover:bg-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Store className="w-3.5 h-3.5 opacity-70" />
                                                <span>{shops.find(s => s._id === selectedShop)?.name || 'All Shops'}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${shopDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {shopDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShopDropdownOpen(false)} />
                                                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden py-1 min-w-[200px] overflow-y-auto max-h-[300px]">
                                                    <button onClick={() => { setSelectedShop(''); setShopDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${!selectedShop ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-500 font-semibold hover:bg-slate-50'}`}>
                                                        <span>All Shops</span>
                                                        {!selectedShop && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Shops</div>
                                                    {shops.map((shop) => (
                                                        <button key={shop._id} onClick={() => { setSelectedShop(shop._id); setShopDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${selectedShop === shop._id ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-500 font-semibold hover:bg-slate-50'}`}>
                                                            <span>{shop.name}</span>
                                                            {selectedShop === shop._id && <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {}
                                <div className="relative">
                                    <button onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer min-w-[140px] transition-all hover:border-slate-300">
                                        <span>{statusFilter || 'All Status'}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {statusDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden py-1 min-w-[140px]">
                                                {['', 'Pending', 'Completed', 'Overdue'].map((option) => (
                                                    <button key={option} onClick={() => { setStatusFilter(option); setStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${statusFilter === option ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-500 font-semibold hover:bg-slate-50'}`}>
                                                        {option || 'All Status'}
                                                        {statusFilter === option && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {}
                                <div className="relative">
                                    <button onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)} className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer min-w-[140px] transition-all hover:border-slate-300">
                                        <span>{priorityFilter || 'All Priority'}</span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${priorityDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {priorityDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setPriorityDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden py-1 min-w-[140px]">
                                                {['', 'High', 'Medium', 'Low'].map((option) => (
                                                    <button key={option} onClick={() => { setPriorityFilter(option); setPriorityDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${priorityFilter === option ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-500 font-semibold hover:bg-slate-50'}`}>
                                                        {option || 'All Priority'}
                                                        {priorityFilter === option && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
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
                                    <p className="mt-5 text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Syncing Tasks...</p>
                                </div>
                            ) : (
                                <div>
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task</th>
                                                {isPlatformAdmin && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shop</th>}
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned By</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {tasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-32 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-4">
                                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-sm relative overflow-hidden group">
                                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                <ClipboardList className="w-10 h-10 text-slate-300 relative z-10" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-slate-900 font-bold text-lg tracking-tight">No tasks found</p>
                                                                <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">Track progress and manage team assignments here. Your created tasks will appear in real-time.</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                tasks.map((task) => {
                                                    const statusInfo = getStatusInfo(task);
                                                    return (
                                                        <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                                                            {}
                                                            <td className="px-6 py-4 max-w-[240px]">
                                                                <p className="font-semibold text-slate-900 text-sm truncate">{task.title}</p>
                                                                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{task.description}</p>
                                                            </td>

                                                            {}
                                                            {isPlatformAdmin && (
                                                                <td className="px-6 py-4">
                                                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                                                        <Store className="w-3 h-3 text-slate-400" />
                                                                        <span className="text-xs font-bold text-slate-700">{task.shopId?.name || 'Main Shop'}</span>
                                                                    </div>
                                                                </td>
                                                            )}

                                                            {}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${getPriorityStyle(task.priority).dot}`} />
                                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${getPriorityStyle(task.priority).text}`}>
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {}
                                                            <td className="px-6 py-4">
                                                                <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${statusInfo.color}`}>
                                                                    {statusInfo.icon}
                                                                    {statusInfo.label}
                                                                </div>
                                                            </td>

                                                            {}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
                                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-slate-800">
                                                                        {isPlatformAdmin 
                                                                            ? (task.assignedTo?.role ? task.assignedTo.role.charAt(0).toUpperCase() + task.assignedTo.role.slice(1) : 'Unknown')
                                                                            : (task.assignedTo?.name || 'Unknown')}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-100">
                                                                        <User className="w-3.5 h-3.5 text-indigo-400" />
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-slate-800">
                                                                        {isPlatformAdmin
                                                                            ? (task.assignedBy?.role ? task.assignedBy.role.charAt(0).toUpperCase() + task.assignedBy.role.slice(1) : 'System')
                                                                            : (task.assignedBy?.role === 'owner' ? 'Owner' : (task.assignedBy?.name || 'Unknown'))}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                    {new Date(task.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </div>
                                                            </td>

                                                            {}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {}
                                                                    <button
                                                                        onClick={() => {
                                                                            setViewTask(task);
                                                                            if (!task.isReadByAssignee && task.assignedTo?._id === (user?.id || user?._id)) {
                                                                                taskApi.markAsRead(task._id);
                                                                            }
                                                                        }}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white rounded-lg text-xs font-bold transition-colors border border-slate-200"
                                                                        title="View Task"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        View
                                                                    </button>

                                                                    {task.assignedTo?._id === (user?.id || user?._id) && (
                                                                        <button
                                                                            onClick={() => handleMarkCompleted(task._id, task.status)}
                                                                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all active:scale-95 ${task.status === 'Completed'
                                                                                ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                                                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                                                }`}
                                                                            title={task.status === 'Completed' ? 'Undo Completion' : 'Mark as Completed'}
                                                                        >
                                                                            {task.status === 'Completed' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                                        </button>
                                                                    )}

                                                                    {/* Edit/Delete only for owner or manager who assigned the task */}
                                                                    {(user?.role === 'owner' || (user?.role === 'manager' && task.assignedBy?._id === (user?.id || user?._id))) && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}
                                                                                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                                                                                title="Edit Task"
                                                                            >
                                                                                <Edit2 className="w-3.5 h-3.5" />
                                                                            </button>

                                                                            <button
                                                                                onClick={() => { setTaskToDelete(task); setIsDeleteModalOpen(true); }}
                                                                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                                                                title="Delete Task"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
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
            {viewTask && (
                <TaskDetailModal
                    task={viewTask}
                    user={user}
                    onMarkAsCompleted={handleMarkCompleted}
                    onClose={() => setViewTask(null)}
                    onTasksRefresh={fetchTasks}
                />
            )}

            {}
            <TaskModal
                isOpen={showTaskModal}
                onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
                onSave={handleSaveTask}
                task={selectedTask}
                user={user}
            />

            {}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete Task"
                type="danger"
            />
        </div>
    );
};

export default Tasks;

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
);
import {
    Store, Users, Package, TrendingUp, ToggleLeft, ToggleRight,
    ShieldCheck, Activity, Search, Filter, ArrowUpRight, ArrowDownRight, Trash2,
    CheckCircle2, XCircle, LogIn, Layers
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import useSidebarStore from "../../store/useSidebarStore";
import { cn } from "../../utils/cn";

const StatCard = ({ icon: Icon, label, value, trend, bgColor, iconColor }) => (
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 group">
        <div className="flex items-center justify-between mb-8">
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", bgColor)}>
                <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
            {trend != null && (
                <div className={cn(
                    "flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full",
                    trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                )}>
                    {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">{label}</p>
        <p className="text-slate-900 text-4xl font-bold tracking-tighter tabular-nums">{value}</p>
    </div>
);

const SuperAdminDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isOpen } = useSidebarStore();
    const [metrics, setMetrics] = useState(null);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!authLoading && user && user.role !== "super_admin") {
            navigate("/");
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!authLoading && user?.role === "super_admin") {
            fetchData();
        }
    }, [authLoading, user]);

    const socket = useSocket();

    useEffect(() => {
        if (!socket || user?.role !== "super_admin") return;

        const refreshData = () => {
            fetchData();
        };

        const events = [
            'shopCreated', 'shopUpdated', 'shopDeleted',
            'userCreated', 'userUpdated', 'userDeleted',
            'taskCreated', 'taskUpdated', 'taskDeleted',
            'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'
        ];

        events.forEach(event => socket.on(event, refreshData));

        return () => {
            events.forEach(event => socket.off(event, refreshData));
        };
    }, [socket, user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [metricsRes, shopsRes] = await Promise.all([
                api.get("/admin/metrics"),
                api.get("/admin/shops"),
            ]);
            setMetrics(metricsRes.data.data);
            setShops(shopsRes.data.data);
        } catch {
            toast.error("Failed to load platform data");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleShop = async (shopId) => {
        try {
            const res = await api.patch(`/admin/shops/${shopId}/toggle`);
            toast.success(res.data.message);
            setShops(prev => prev.map(s => s._id === shopId ? { ...s, isActive: !s.isActive } : s));
        } catch {
            toast.error("Failed to toggle shop status");
        }
    };

    const handleDeleteShop = async (shopId) => {
        if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently remove the shop, all its products, and all its staff members. This action cannot be undone.")) {
            return;
        }

        try {
            const res = await api.delete(`/admin/shops/${shopId}`);
            toast.success(res.data.message);
            setShops(prev => prev.filter(s => s._id !== shopId));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete shop");
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const shopStatusData = [
        { name: "Active", value: metrics?.activeShops ?? 0 },
        { name: "Suspended", value: (metrics?.totalShops ?? 0) - (metrics?.activeShops ?? 0) },
    ];

    const platformTrendData = [
        { name: "Oct", shops: 0, products: 0 },
        { name: "Nov", shops: 0, products: 0 },
        { name: "Dec", shops: 0, products: 0 },
        { name: "Jan", shops: 0, products: 0 },
        { name: "Feb", shops: 0, products: 0 },
        { name: "Mar", shops: metrics?.totalShops ?? 0, products: metrics?.totalProducts ?? 0 },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#0f172a',
                bodyColor: '#0f172a',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#94a3b8", font: { size: 10, weight: 'bold' } },
                border: { display: false }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: { color: "#94a3b8", font: { size: 10 } },
                border: { display: false }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const growthData = {
        labels: platformTrendData.map(d => d.name),
        datasets: [
            {
                label: 'Shops',
                data: platformTrendData.map(d => d.shops),
                borderColor: '#6366f1',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'Products',
                data: platformTrendData.map(d => d.products),
                borderColor: '#10b981',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };

    const statusPieData = {
        labels: shopStatusData.map(d => d.name),
        datasets: [{
            data: shopStatusData.map(d => d.value),
            backgroundColor: ['#10b981', '#f1f5f9'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#0f172a',
                bodyColor: '#0f172a',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12
            }
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <main className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin shadow-sm" />
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Portal...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!user || user.role !== "super_admin") return null;

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
            <Sidebar />

            <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'} p-4 sm:p-8 pt-24 lg:pt-8`}>
                {}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                            Platform Overview
                        </span>
                        <div className="flex items-center gap-3 mb-2 mt-1">
                            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform <span className="text-slate-400 font-normal">Command</span></h1>
                        </div>
                        <p className="text-slate-500 font-medium text-sm ml-1">Global infrastructure and store monitoring portal</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl w-64 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-900 text-sm font-medium shadow-sm hover:border-slate-300"
                            />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[500px]">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-6" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Platform Data</p>
                    </div>
                ) : (
                    <>
                        {}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard icon={Store} label="Total Shops" value={metrics?.totalShops ?? 0} trend={12} bgColor="bg-indigo-50" iconColor="text-indigo-600" />
                            <StatCard icon={Users} label="Total Users" value={metrics?.totalUsers ?? 0} trend={8} bgColor="bg-emerald-50" iconColor="text-emerald-600" />
                            <StatCard icon={Package} label="Total Products" value={metrics?.totalProducts ?? 0} trend={24} bgColor="bg-amber-50" iconColor="text-amber-600" />
                            <StatCard icon={TrendingUp} label="Platform Health" value={`${((metrics?.activeShops / metrics?.totalShops) * 100 || 0).toFixed(1)}%`} trend={2} bgColor="bg-rose-50" iconColor="text-rose-600" />
                        </div>

                        {}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {}
                            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-3">
                                            <Activity className="w-5 h-5 text-indigo-600" />
                                            Platform Growth
                                        </h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shops & Product Registry</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100" /> 
                                            Stores
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-100" /> 
                                            Items
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[350px]">
                                    <Line data={growthData} options={chartOptions} />
                                </div>
                            </div>

                            {}
                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
                                <h2 className="text-base font-bold text-slate-900 mb-10 flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-indigo-600" />
                                    Active Ratio
                                </h2>
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="w-full h-[240px] relative">
                                        <Pie data={statusPieData} options={pieOptions} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <p className="text-4xl font-bold text-slate-800 tracking-tight tabular-nums">
                                                {Math.round((metrics?.activeShops / metrics?.totalShops) * 100 || 0)}%
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Active</p>
                                        </div>
                                    </div>
                                    <div className="mt-10 flex justify-center gap-12 w-full pt-8 border-t border-slate-50">
                                        {shopStatusData.map((item, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">{item.name}</span>
                                                <span className={cn("text-2xl font-bold tabular-nums", i === 0 ? "text-emerald-600" : "text-slate-400")}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-base font-bold text-slate-900">Registered Shops</h2>
                                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                                    {shops.length} shops
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                                            <th className="px-6 py-3 text-left">Shop</th>
                                            <th className="px-6 py-3 text-left">Status</th>
                                            <th className="px-6 py-3 text-left">Registered</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredShops.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center">
                                                    <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-slate-400 font-medium text-sm">No shops match your search</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredShops.map((shop) => (
                                                <tr key={shop._id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                                                                {shop.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-900 font-semibold text-sm">{shop.name}</p>
                                                                <p className="text-slate-400 text-xs">ID: {shop._id.slice(-8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${shop.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${shop.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                            {shop.isActive ? "Active" : "Suspended"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                                        {new Date(shop.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleToggleShop(shop._id)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shadow-sm ${shop.isActive ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"}`}
                                                                title={shop.isActive ? "Suspend Shop" : "Activate Shop"}
                                                            >
                                                                {shop.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                                {shop.isActive ? "Suspend" : "Activate"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteShop(shop._id)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100 shadow-sm md:shadow-none"
                                                                title="Delete Shop"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default SuperAdminDashboard;

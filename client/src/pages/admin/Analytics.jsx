import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar as ReBar,
    XAxis, YAxis, Tooltip as ReTooltip, PieChart, Pie, Cell
} from 'recharts';
import { Activity, TrendingUp, Users, Package, Layers, Store, ShieldCheck, ArrowUpRight } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import useSidebarStore from "../../store/useSidebarStore";
import { cn } from "../../utils/cn";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const RECHARTS_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

const CHART_STYLES = `
  .recharts-wrapper:focus { outline: none !important; }
  .recharts-surface:focus { outline: none !important; }
  .recharts-sector:focus { outline: none !important; }
  .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .custom-scrollbar::-webkit-scrollbar { display: none; }
`;


const tooltipDefaults = {
    backgroundColor: '#fff',
    titleColor: '#0f172a',
    bodyColor: '#0f172a',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: 12,
    boxPadding: 6,
    usePointStyle: true,
    titleFont: { size: 12, weight: 'bold' },
    bodyFont: { size: 11 },
};

const baseScales = {
    x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10, weight: 'bold' } }, border: { display: false } },
    y: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } }, border: { display: false } },
};



const ModernDonutCard = ({ title, data, total, trend, icon: Icon, colors }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center aspect-square group relative">
        <div className="w-full flex items-center justify-between mb-auto relative z-10">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                {title}
            </h2>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
        </div>

        <div className="w-full flex-1 flex items-center justify-center relative my-4">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Net Value</p>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-slate-800 tracking-tight tabular-nums">
                        {total >= 1000 ? (total / 1000).toFixed(1) + "K" : total}
                    </span>
                    {trend != null && (
                        <div className={cn(
                            "mt-2 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border",
                            trend >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-500"
                        )}>
                            {trend >= 0 ? "+" : "-"}{Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius="62%" outerRadius="92%"
                        paddingAngle={6} dataKey="value" stroke="none"
                        animationBegin={0} animationDuration={1500} cornerRadius={10}>
                        {data.map((_, index) => (
                            <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <ReTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold', background: '#fff' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 mt-auto relative z-10">
            {data.slice(0, 2).map((item, i) => {
                const perc = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                return (
                    <div key={i} className="flex flex-col items-center p-3.5 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[70px]">{item.name}</span>
                        </div>
                        <span className="text-base font-black text-slate-900 tabular-nums">{perc}%</span>
                    </div>
                );
            })}
        </div>
    </div>
);



const ChartCard = ({ title, subtitle, icon: Icon, iconBg, iconCol, children, span = "" }) => (
    <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col", span)}>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", iconBg)}>
                        <Icon className={cn("w-3.5 h-3.5", iconCol)} />
                    </div>
                    {title}
                </h3>
                {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-7">{subtitle}</p>}
            </div>
        </div>
        <div className="flex-1">{children}</div>
    </div>
);


const StatPill = ({ label, value, color }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-3xl font-bold tracking-tight tabular-nums", color)}>{value}</p>
    </div>
);

const Analytics = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isOpen } = useSidebarStore();
    const [analytics, setAnalytics] = useState(null);
    const [shopMetrics, setShopMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const isSuperAdmin = user?.role === "super_admin";
    const isShopUser = user?.role === "owner" || user?.role === "manager";

    useEffect(() => {
        if (!authLoading && !user) navigate("/login");
    }, [user, authLoading, navigate]);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/analytics");
            setAnalytics(res.data.data);
        } catch { toast.error("Failed to load analytics data"); }
        finally { setLoading(false); }
    }, []);

    const fetchShopMetrics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/products/metrics/stats");
            setShopMetrics(res.data.data);
        } catch { toast.error("Failed to load shop metrics"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            if (isSuperAdmin) fetchAnalytics();
            else if (isShopUser) fetchShopMetrics();
            else navigate("/");
        }
    }, [authLoading, user, isSuperAdmin, isShopUser, navigate, fetchAnalytics, fetchShopMetrics]);

    const socket = useSocket();

    useEffect(() => {
        if (!socket || !user) return;

        const refreshData = () => {
            if (isSuperAdmin) fetchAnalytics();
            else if (isShopUser) fetchShopMetrics();
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
    }, [socket, user, isSuperAdmin, isShopUser, fetchAnalytics, fetchShopMetrics]);

    
    const categoryStats = shopMetrics?.categoryStats?.map(d => ({ name: d.name, value: d.count })) || [];
    
    const subcategoryStats = shopMetrics?.subcategoryStats?.map(d => ({ name: d.name, value: d.count })) || [];
    const priceDistribution = shopMetrics?.priceDistribution?.map(d => ({ name: d.name, value: d.count })) || [];
    const contributorStats = shopMetrics?.contributorStats?.map(d => ({ name: d.name, value: d.count })) || [];

    let cumulativeCount = 0;
    const productGrowth = shopMetrics?.productGrowth?.map(d => {
        cumulativeCount += d.count;
        return { name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: cumulativeCount };
    }) || [];

    
    const aData = analytics;

    
    const platformGrowthData = {
        labels: aData?.platformTrend?.map(d => d.month) || [],
        datasets: [
            {
                label: 'Shops',
                data: aData?.platformTrend?.map(d => d.shops) || [],
                borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)',
                fill: true, tension: 0.4, borderWidth: 3,
                pointBackgroundColor: '#fff', pointBorderWidth: 2, pointRadius: 4,
            },
            {
                label: 'Products',
                data: aData?.platformTrend?.map(d => d.products) || [],
                borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',
                fill: true, tension: 0.4, borderWidth: 3,
                pointBackgroundColor: '#fff', pointBorderWidth: 2, pointRadius: 4,
            },
        ],
    };

    
    const shopStatusData = {
        labels: ['Active', 'Suspended'],
        datasets: [{
            data: [aData?.summary?.activeShops || 0, (aData?.summary?.totalShops || 0) - (aData?.summary?.activeShops || 0)],
            backgroundColor: ['#10b981', '#f1f5f9'],
            hoverBackgroundColor: ['#059669', '#e2e8f0'],
            borderWidth: 0,
        }],
    };

    
    const userRoleLabels = aData?.userDistribution?.filter(d => d._id != null).map(d => d._id.charAt(0).toUpperCase() + d._id.slice(1)) || [];
    const userRoleColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
    const userRoleData = {
        labels: userRoleLabels,
        datasets: [{
            data: aData?.userDistribution?.filter(d => d._id != null).map(d => d.count) || [],
            backgroundColor: userRoleColors,
            borderWidth: 0,
        }],
    };

    
    const loginStats = aData?.loginStats?.map(d => ({
        name: new Date(d._id).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        value: d.count,
    })) || [];

    
    const userGrowthData = {
        labels: aData?.userGrowth?.map(d => d.month) || [],
        datasets: [{
            label: 'New Users',
            data: aData?.userGrowth?.map(d => d.users) || [],
            backgroundColor: aData?.userGrowth?.map((_, i) => `hsl(${240 + i * 15}, 70%, ${65 - i * 3}%)`) || [],
            borderRadius: 8, barThickness: 32,
        }],
    };

    
    const shopProdData = {
        labels: aData?.shopProductDistribution?.map(d => d.name) || [],
        datasets: [{
            label: 'Products',
            data: aData?.shopProductDistribution?.map(d => d.count) || [],
            backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'],
            borderRadius: 6, barThickness: 28,
        }],
    };

    
    const stockHealthData = {
        labels: ['In Stock', 'Out of Stock'],
        datasets: [{
            data: [aData?.stockHealth?.inStock || 0, aData?.stockHealth?.outOfStock || 0],
            backgroundColor: ['#10b981', '#ef4444'],
            hoverBackgroundColor: ['#059669', '#dc2626'],
            borderWidth: 0,
        }],
    };

    
    const catDistData = {
        labels: aData?.categoryDistribution?.map(d => d.name) || [],
        datasets: [{
            label: 'Products',
            data: aData?.categoryDistribution?.map(d => d.count) || [],
            backgroundColor: aData?.categoryDistribution?.map((_, i) => [
                '#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#f43f5e','#14b8a6','#0ea5e9'
            ][i % 10]) || [],
            borderRadius: 8, barThickness: 40,
        }],
    };

    
    const priceRangeData = {
        labels: aData?.priceRangeDistribution?.map(d => d.name) || [],
        datasets: [{
            label: 'Products',
            data: aData?.priceRangeDistribution?.map(d => d.count) || [],
            backgroundColor: ['#818cf8','#6366f1','#4f46e5','#4338ca','#3730a3','#312e81','#1e1b4b','#0f0d2d'],
            borderRadius: 8, barThickness: 36,
        }],
    };

    const doughnutOptions = () => ({
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutQuart' },
        plugins: {
            legend: { display: false },
            tooltip: { ...tooltipDefaults, callbacks: {} },
        },
    });

    const barOptions = (indexAxis = 'x') => ({
        responsive: true, maintainAspectRatio: false, indexAxis,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: tooltipDefaults },
        scales: indexAxis === 'x' ? baseScales : {
            x: { ...baseScales.y },
            y: { ...baseScales.x },
        },
    });

    if (authLoading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <main className={`flex-1 flex items-center justify-center transition-all duration-300 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                        <p className="text-slate-500 font-medium text-sm">Loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!user || (!isSuperAdmin && !isShopUser)) return null;

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                <style>{CHART_STYLES}</style>
                <div className="pt-[72px] lg:pt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">

                        {}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                    {isSuperAdmin ? "Platform Overview" : "Inventory Overview"}
                                </span>
                                <div className="flex items-center gap-3 mb-2 mt-1">
                                    {isSuperAdmin && (
                                        <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                            <ShieldCheck className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                        Analytics <span className="text-slate-400 font-normal">Dashboard</span>
                                    </h1>
                                </div>
                                <p className="text-slate-500 font-medium text-sm ml-1">
                                    {isSuperAdmin ? "Complete platform intelligence and metrics overview" : "Strategic performance metrics and distribution overview"}
                                </p>
                            </div>
                            {!isSuperAdmin && (
                                <div className="-mt-6 self-start lg:self-center">
                                    <Activity className="w-6 h-6 text-slate-900" />
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Processing Data...</p>
                            </div>
                        ) : isSuperAdmin ? (

                            
                            <div className="space-y-6 pb-16">

                                {}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <StatPill label="Total Shops" value={aData?.summary?.totalShops ?? 0} color="text-indigo-600" />
                                    <StatPill label="Active Shops" value={aData?.summary?.activeShops ?? 0} color="text-emerald-600" />
                                    <StatPill label="Total Users" value={aData?.summary?.totalUsers ?? 0} color="text-slate-900" />
                                    <StatPill label="Total Products" value={aData?.summary?.totalProducts ?? 0} color="text-amber-600" />
                                </div>

                                {}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <ChartCard title="Platform Growth" subtitle="Shops & Products · Last 6 Months"
                                        icon={TrendingUp} iconBg="bg-indigo-50" iconCol="text-indigo-600" span="lg:col-span-2">
                                        <div className="flex items-center gap-6 mb-4 ml-1">
                                            {[{ col: '#6366f1', label: 'Shops' }, { col: '#10b981', label: 'Products' }].map(l => (
                                                <div key={l.label} className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.col }} />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ height: 260 }}>
                                            <Line data={platformGrowthData} options={{
                                                responsive: true, maintainAspectRatio: false,
                                                animation: { duration: 1200, easing: 'easeOutQuart' },
                                                plugins: { legend: { display: false }, tooltip: tooltipDefaults },
                                                scales: baseScales, interaction: { mode: 'index', intersect: false },
                                            }} />
                                        </div>
                                    </ChartCard>

                                    <ChartCard title="Shop Status" subtitle="Active vs Suspended"
                                        icon={Store} iconBg="bg-emerald-50" iconCol="text-emerald-600">
                                        <div className="relative" style={{ height: 200 }}>
                                            <Doughnut data={shopStatusData} options={doughnutOptions()} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <p className="text-3xl font-bold text-slate-800 tabular-nums">
                                                    {aData?.summary?.activeShops ?? 0}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Active</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            {['Active', 'Suspended'].map((l, i) => (
                                                <div key={l} className="text-center p-2.5 rounded-xl bg-slate-50">
                                                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: i === 0 ? '#10b981' : '#f1f5f9' }} />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l}</p>
                                                    <p className="text-lg font-bold text-slate-900">{i === 0 ? (aData?.summary?.activeShops ?? 0) : ((aData?.summary?.totalShops ?? 0) - (aData?.summary?.activeShops ?? 0))}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>
                                </div>

                                {}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <ChartCard title="User Role Distribution" subtitle="By Role Type"
                                        icon={Users} iconBg="bg-violet-50" iconCol="text-violet-600">
                                        <div className="relative" style={{ height: 180 }}>
                                            <Doughnut data={userRoleData} options={doughnutOptions()} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {userRoleLabels.map((l, i) => (
                                                <div key={l} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: userRoleColors[i % userRoleColors.length] }} />
                                                    <span className="text-[10px] font-bold text-slate-500 truncate">{l}</span>
                                                    <span className="text-[10px] font-bold text-slate-900 ml-auto">
                                                        {aData?.userDistribution?.filter(d => d._id != null)[i]?.count ?? 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>

                                    <ChartCard title="User Growth" subtitle="New Registrations · Last 6 Months"
                                        icon={TrendingUp} iconBg="bg-blue-50" iconCol="text-blue-600">
                                        <div style={{ height: 260 }}>
                                            <Bar data={userGrowthData} options={barOptions()} />
                                        </div>
                                    </ChartCard>

                                    <ChartCard title="Daily Login Activity" subtitle="Last 7 Days"
                                        icon={Activity} iconBg="bg-indigo-50" iconCol="text-indigo-600">
                                        <div style={{ height: 260 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={loginStats}>
                                                    <defs>
                                                        <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <ReTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', fontWeight: 'bold' }} />
                                                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#loginGrad)" strokeLinecap="round" name="Logins" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </ChartCard>
                                </div>

                                {}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <ChartCard title="Products Per Shop" subtitle="All Shops by Inventory Size"
                                        icon={Package} iconBg="bg-amber-50" iconCol="text-amber-600" span="lg:col-span-2">
                                        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ maxHeight: 320 }}>
                                            <div style={{ height: Math.max(110, (aData?.shopProductDistribution?.length || 1) * 48 + 60) }}>
                                                <Bar data={shopProdData} options={{
                                                    ...barOptions('y'),
                                                    animation: { duration: 1200, easing: 'easeOutQuart' },
                                                    layout: { padding: { top: 8, bottom: 0 } },
                                                    scales: {
                                                        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } }, border: { display: false } },
                                                        y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }, border: { display: false } },
                                                    },
                                                }} />
                                            </div>
                                        </div>
                                    </ChartCard>

                                    <ChartCard title="Platform Stock Health" subtitle="In Stock vs Out of Stock"
                                        icon={Layers} iconBg="bg-rose-50" iconCol="text-rose-600">
                                        <div className="relative" style={{ height: 200 }}>
                                            <Doughnut data={stockHealthData} options={doughnutOptions()} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <p className="text-2xl font-bold text-slate-800 tabular-nums">
                                                    {aData?.stockHealth ? Math.round((aData.stockHealth.inStock / (aData.stockHealth.inStock + aData.stockHealth.outOfStock || 1)) * 100) : 0}%
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">In Stock</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            {[
                                                { label: 'In Stock', val: aData?.stockHealth?.inStock ?? 0, col: '#10b981' },
                                                { label: 'Out of Stock', val: aData?.stockHealth?.outOfStock ?? 0, col: '#ef4444' },
                                            ].map(item => (
                                                <div key={item.label} className="text-center p-2.5 rounded-xl bg-slate-50">
                                                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: item.col }} />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{item.label}</p>
                                                    <p className="text-lg font-bold text-slate-900">{item.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>
                                </div>

                                {}
                                <ChartCard title="Category Distribution" subtitle="Products by Category Across Platform"
                                    icon={Layers} iconBg="bg-indigo-50" iconCol="text-indigo-600">
                                    <div className="overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                                        <div style={{ height: 260, minWidth: Math.max(700, (aData?.categoryDistribution?.length || 0) * 90) }}>
                                            <Bar data={catDistData} options={{ ...barOptions(), maintainAspectRatio: false }} />
                                        </div>
                                    </div>
                                </ChartCard>

                                {}
                                <ChartCard title="Price Range Distribution" subtitle="Products Bucketed by Price Band"
                                    icon={TrendingUp} iconBg="bg-violet-50" iconCol="text-violet-600">
                                    <div className="overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                                        <div style={{ height: 240, minWidth: Math.max(600, (aData?.priceRangeDistribution?.length || 0) * 100) }}>
                                            <Bar data={priceRangeData} options={{ ...barOptions(), maintainAspectRatio: false }} />
                                        </div>
                                    </div>
                                </ChartCard>

                            </div>

                        ) : (
                            
                            <div className="space-y-8 pb-16">
                                {}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: "Total Assets", val: shopMetrics?.totalProducts || 0, col: "text-slate-900" },
                                        { label: "Active Stock", val: shopMetrics?.inStock || 0, col: "text-emerald-600" },
                                        { label: "Critical Stock", val: shopMetrics?.outOfStock || 0, col: "text-rose-500" },
                                        { label: "Health Index", val: (shopMetrics?.totalProducts ? Math.round((shopMetrics.inStock / shopMetrics.totalProducts) * 100) : 0) + "%", col: "text-indigo-600" }
                                    ].map((card, i) => (
                                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                            <p className={cn("text-2xl font-bold tracking-tight tabular-nums", card.col)}>{card.val}</p>
                                        </div>
                                    ))}
                                </div>

                                {}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ModernDonutCard title="Inventory Vitality"
                                        data={[
                                            { name: 'Active', value: shopMetrics?.inStock || 0 },
                                            { name: 'Critical', value: shopMetrics?.outOfStock || 0 }
                                        ]}
                                        total={shopMetrics?.totalProducts || 0} trend={12.4}
                                        icon={Activity} colors={['#10b981', '#ef4444']}
                                    />
                                    <ModernDonutCard title="Market Segments"
                                        data={priceDistribution} total={shopMetrics?.totalProducts || 0}
                                        trend={5.2} icon={TrendingUp}
                                        colors={["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]}
                                    />
                                    <ModernDonutCard title="Asset Curators"
                                        data={contributorStats} total={shopMetrics?.totalProducts || 0}
                                        trend={18.2} icon={Users}
                                        colors={["#6366f1", "#ec4899", "#10b981", "#f59e0b"]}
                                    />

                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col aspect-square relative group">
                                        <div className="mb-6">
                                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-emerald-500" />
                                                Accumulation Curve
                                            </h2>
                                        </div>
                                        <div className="flex-1">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={productGrowth}>
                                                    <defs>
                                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                    <ReTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold' }} />
                                                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" strokeLinecap="round" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[440px]">
                                    <div className="flex items-center justify-between mb-8 flex-shrink-0">
                                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-indigo-500" />
                                            Category Performance
                                        </h2>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Nodes: {categoryStats.length}
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
                                        <div style={{ height: "320px", minWidth: Math.max(900, categoryStats.length * 100) }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={categoryStats} margin={{ bottom: 20 }}>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} interval={0} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                                    <ReTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold' }} />
                                                    <ReBar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                                                        {categoryStats.map((_, index) => (
                                                            <Cell key={index} fill={RECHARTS_COLORS[index % RECHARTS_COLORS.length]} style={{ outline: 'none' }} />
                                                        ))}
                                                    </ReBar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;

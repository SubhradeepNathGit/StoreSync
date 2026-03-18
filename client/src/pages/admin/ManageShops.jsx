import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import {
    Store, Users, Search, X, Loader, Building2, Trash2,
    CheckCircle2, XCircle, Package, ChevronRight, Mail, User
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import useSidebarStore from "../../store/useSidebarStore";
import { cn } from "../../utils/cn";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3006';

const ManageShops = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isOpen } = useSidebarStore();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [modalTab, setModalTab] = useState("personnel"); 

    
    const [shopUsers, setShopUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    
    const [shopInventory, setShopInventory] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(false);

    useEffect(() => {
        if (!authLoading && user && user.role !== "super_admin") navigate("/");
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!authLoading && user?.role === "super_admin") fetchShops();
    }, [authLoading, user]);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/shops");
            setShops(res.data.data);
        } catch {
            toast.error("Failed to load shops");
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
        if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently remove the shop, all its products, and all its staff members. This action cannot be undone.")) return;
        try {
            const res = await api.delete(`/admin/shops/${shopId}`);
            toast.success(res.data.message);
            setShops(prev => prev.filter(s => s._id !== shopId));
            if (selectedShop?._id === shopId) setIsModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete shop");
        }
    };

    const openShopModal = async (shop, tab = "personnel") => {
        setSelectedShop(shop);
        setModalTab(tab);
        setIsModalOpen(true);
        setShopUsers([]);
        setShopInventory([]);
        if (tab === "personnel") fetchPersonnel(shop._id);
        else fetchInventory(shop._id);
    };

    const fetchPersonnel = async (shopId) => {
        setLoadingUsers(true);
        try {
            const res = await api.get(`/admin/shops/${shopId}/users`);
            setShopUsers(res.data.data);
        } catch { toast.error("Failed to load personnel"); }
        finally { setLoadingUsers(false); }
    };

    const fetchInventory = async (shopId) => {
        setLoadingInventory(true);
        try {
            const res = await api.get(`/admin/shops/${shopId}/inventory`);
            setShopInventory(res.data.data);
        } catch { toast.error("Failed to load inventory"); }
        finally { setLoadingInventory(false); }
    };

    const handleTabSwitch = (tab) => {
        setModalTab(tab);
        if (tab === "personnel" && shopUsers.length === 0) fetchPersonnel(selectedShop._id);
        if (tab === "inventory" && shopInventory.length === 0) fetchInventory(selectedShop._id);
    };

    const filteredShops = shops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    if (!user || user.role !== "super_admin") return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'} p-4 sm:p-8 pt-24 lg:pt-8`}>
                {}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                            Store Management
                        </span>
                        <div className="flex items-center gap-3 mb-2 mt-1">
                            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage <span className="text-slate-400 font-normal">Shops</span></h1>
                        </div>
                        <p className="text-slate-500 font-medium text-sm ml-1">Full control over registered shops and their personnel</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search shops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl w-64 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-900 text-sm font-medium shadow-sm hover:border-slate-300"
                            />
                        </div>
                    </div>
                </header>

                {}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {[
                        { label: "Total Shops", val: shops.length, icon: Store, bg: "bg-indigo-50", col: "text-indigo-600" },
                        { label: "Active", val: shops.filter(s => s.isActive).length, icon: Building2, bg: "bg-emerald-50", col: "text-emerald-600" },
                        { label: "Suspended", val: shops.filter(s => !s.isActive).length, icon: X, bg: "bg-rose-50", col: "text-rose-600" },
                    ].map((c, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <div className={cn("inline-flex p-2.5 rounded-xl mb-3", c.bg)}>
                                <c.icon className={cn("w-4 h-4", c.col)} />
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{c.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{c.val}</p>
                        </div>
                    ))}
                </div>

                {}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900">All Shops</h2>
                        <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                            {filteredShops.length} results
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                                    <th className="px-6 py-3 text-left">Shop</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Registered</th>
                                    <th className="px-6 py-3 text-center">Personnel</th>
                                    <th className="px-6 py-3 text-center">Inventory</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Loader className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-3" />
                                            <p className="text-slate-400 font-medium text-sm">Loading shops...</p>
                                        </td>
                                    </tr>
                                ) : filteredShops.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-slate-400 font-medium text-sm">No shops match your search</p>
                                        </td>
                                    </tr>
                                ) : filteredShops.map((shop) => (
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
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openShopModal(shop, "personnel")}
                                                className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:text-indigo-700 transition-colors"
                                            >
                                                <Users className="w-4 h-4" />
                                                View <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openShopModal(shop, "inventory")}
                                                className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold hover:text-emerald-700 transition-colors"
                                            >
                                                <Package className="w-4 h-4" />
                                                View <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleShop(shop._id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shadow-sm ${shop.isActive ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"}`}
                                                >
                                                    {shop.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    {shop.isActive ? "Suspend" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteShop(shop._id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100"
                                                    title="Delete Shop"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {}
            {isModalOpen && selectedShop && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">

                        {}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {selectedShop.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{selectedShop.name}</h2>
                                    <p className="text-xs text-slate-400 font-medium">ID: {selectedShop._id.slice(-12)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${selectedShop.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedShop.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                                    {selectedShop.isActive ? "Active" : "Suspended"}
                                </span>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {}
                        <div className="flex gap-1 px-6 pt-4 shrink-0">
                            {[
                                { id: "personnel", label: "Personnel", icon: Users },
                                { id: "inventory", label: "Inventory", icon: Package },
                            
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => handleTabSwitch(id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                                        modalTab === id
                                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                            : "text-slate-500 hover:bg-slate-100"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {}
                        <div className="flex-1 overflow-y-auto p-6">

                            {}
                            {modalTab === "personnel" && (
                                loadingUsers ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                                        <p className="text-slate-400 font-medium text-sm">Loading personnel...</p>
                                    </div>
                                ) : shopUsers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium text-sm">No users in this shop</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {shopUsers.map((u) => (
                                            <div key={u._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 transition-all flex items-start gap-4">
                                                <img
                                                    src={u.profileImage && u.profileImage !== 'no-photo.jpg'
                                                        ? (u.profileImage.startsWith('http') ? u.profileImage : `${BASE_URL}/uploads/${u.profileImage}`)
                                                        : `https://via.placeholder.com/150`}
                                                    alt={u.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">{u.name}</h4>
                                                        <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shrink-0",
                                                            u.role === 'owner' ? 'bg-indigo-600 text-white' : u.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                                        )}>
                                                            {u.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-2 truncate">
                                                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                        {u.email}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`flex items-center gap-1 text-[10px] font-bold ${u.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            <div className={`w-1 h-1 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {u.isActive ? 'Active' : 'Locked'}
                                                        </span>
                                                        <span className="text-slate-300 text-xs">·</span>
                                                        <span className="text-slate-400 text-[10px]">Since {new Date(u.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                            {}
                            {modalTab === "inventory" && (
                                loadingInventory ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                                        <p className="text-slate-400 font-medium text-sm">Loading inventory...</p>
                                    </div>
                                ) : shopInventory.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium text-sm">No products in this shop</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {shopInventory.length} Products
                                            </p>
                                            <div className="flex gap-3 text-xs font-bold">
                                                <span className="text-emerald-600">
                                                    {shopInventory.filter(p => p.inStock).length} In Stock
                                                </span>
                                                <span className="text-rose-500">
                                                    {shopInventory.filter(p => !p.inStock).length} Out of Stock
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {shopInventory.map((product) => (
                                                <div key={product._id} className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group">
                                                    {}
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                                                        <img
                                                            src={product.image && product.image !== 'no-photo.jpg'
                                                                ? (product.image.startsWith('http') ? product.image : `${BASE_URL}/uploads/${product.image}`)
                                                                : `https://via.placeholder.com/150`}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {product.category && (
                                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                                                    {product.category.name}
                                                                </span>
                                                            )}
                                                            {product.subcategory && (
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                                    {product.subcategory.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {}
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-bold text-slate-900">₹{product.price.toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400">{new Date(product.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                                                    </div>

                                                    {}
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shrink-0",
                                                        product.inStock ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                                                    )}>
                                                        {product.inStock ? "In Stock" : "Out"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageShops;

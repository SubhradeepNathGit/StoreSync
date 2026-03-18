import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import {
    X,
    Camera,
    Package,
    User,
    Mail,
    Save,
    Loader,
    ChevronRight,
    Lock,
    Eye,
    EyeOff,
    Pencil
} from "lucide-react";
import AuthContext from "../../context/AuthContext";
import productApi from "../../api/productApi";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import ProductCard from "../products/ProductCard";

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updatePassword } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState("info");
    const [userProducts, setUserProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || "");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fileInputRef = useRef(null);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.new !== passwordData.confirm) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.new.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await updatePassword(passwordData.current, passwordData.new);
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            console.error("Password update error:", err);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const fetchUserProducts = useCallback(async () => {
        try {
            setLoadingProducts(true);
            const res = await productApi.getAllProducts({
                userId: user.id || user._id,
                limit: 100,
            });
            setUserProducts(res?.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your products");
        } finally {
            setLoadingProducts(false);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && user) {
            setEditName(user.name);
            if (activeTab === "products") {
                fetchUserProducts();
            }
        }
    }, [isOpen, activeTab, user, fetchUserProducts]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            setIsSaving(true);
            const formData = new FormData();
            formData.append("name", editName.trim());
            if (selectedFile) {
                formData.append("profileImage", selectedFile);
            }

            const res = await api.put("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const profileImageUrl =
        previewUrl ||
        (user?.profileImage && user.profileImage !== "no-photo.jpg"
            ? user.profileImage.startsWith("http")
                ? user.profileImage
                : `http://localhost:3006/${user.profileImage}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0f172a&color=fff&size=200`);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {}
            <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] min-h-[500px]">
                {}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h2>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Manage account configuration
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeTab === "info" && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                                title="Edit Profile"
                            >
                                <Pencil className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-white rounded-2xl transition-all group shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
                        >
                            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:rotate-90 transition-all" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {}
                    <div className="w-full md:w-72 bg-slate-50/30 border-r border-slate-100 p-6 space-y-2 shrink-0">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider ${activeTab === "info"
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span className="flex-1 text-left">Personal Info</span>
                            {activeTab === "info" && (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("products")}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider ${activeTab === "products"
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            <span className="flex-1 text-left">My Products</span>
                            {activeTab === "products" && (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        {user?.role === 'employee' && (
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider ${activeTab === "security"
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                                    }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span className="flex-1 text-left">Security</span>
                                {activeTab === "security" && (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>


                    {}
                    <div className="flex-1 overflow-y-auto bg-white/50">
                        {}
                        {activeTab === "info" && (
                            <div className="p-8 md:p-12">
                                <div className="max-w-2xl mx-auto space-y-10">
                                    <div className="flex flex-col items-center text-center pb-10">
                                        <div className="relative group mb-8">
                                            <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white ring-1 ring-slate-100 shadow-2xl shadow-slate-200">
                                                <img
                                                    src={profileImageUrl}
                                                    alt={user?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {isEditing && (
                                                <button
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="absolute bottom-1 right-1 p-2.5 bg-slate-800 text-white rounded-full border-2 border-white shadow-2xl hover:scale-110 hover:bg-slate-900 transition-all z-10"
                                                >
                                                    <Camera className="w-5 h-5" />
                                                </button>
                                            )}

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>

                                        {!isEditing ? (
                                            <>
                                                <h3 className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">
                                                    {user?.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                    {user?.role === 'owner' ? 'Store Owner' : (user?.role || 'User')}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                    {user?.shopName || "My Store"}
                                                </p>
                                                <p className="text-slate-400 font-medium flex items-center justify-center gap-2 mb-10">
                                                    <Mail className="w-4 h-4 text-slate-300" />
                                                    {user?.email}
                                                </p>
                                            </>
                                        ) : (
                                            <div className="w-full space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                                    <input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none bg-white font-medium transition-all"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setEditName(user?.name);
                                                            setSelectedFile(null);
                                                            setPreviewUrl(null);
                                                        }}
                                                        className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-white hover:border-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={isSaving}
                                                        className="flex-1 py-4 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider hover:bg-slate-900 disabled:opacity-70 shadow-lg shadow-slate-200 transition-all"
                                                    >
                                                        {isSaving ? (
                                                            <Loader className="animate-spin w-5 h-5" />
                                                        ) : (
                                                            <Save className="w-5 h-5" />
                                                        )}
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === "products" && (
                            <div className="p-8 md:p-12">
                                {loadingProducts ? (
                                    <div className="flex justify-center py-20">
                                        <div className="relative w-12 h-12">
                                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </div>
                                ) : userProducts.length ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                                        {userProducts.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                                            <Package className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">No Assets Found</h4>
                                        <p className="text-slate-400 text-sm font-medium">You haven't indexed any products in the network yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {}
                        {activeTab === "security" && (
                            <div className="p-8 md:p-12">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <Lock className="w-6 h-6 text-slate-900" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">Security</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update credentials</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        required
                                                        value={passwordData.current}
                                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none bg-slate-50/30 font-medium transition-all pr-12"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-900 transition-colors"
                                                    >
                                                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        required
                                                        value={passwordData.new}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none bg-slate-50/30 font-medium transition-all pr-12"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-900 transition-colors"
                                                    >
                                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 ml-1">
                                                    Min. 6 alphanumeric characters
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        required
                                                        value={passwordData.confirm}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none bg-slate-50/30 font-medium transition-all pr-12"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-900 transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={isUpdatingPassword}
                                                    className="w-full py-5 bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-200 transition-all"
                                                >
                                                    {isUpdatingPassword ? (
                                                        <>
                                                            <Loader className="animate-spin w-5 h-5" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            Update Password
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;

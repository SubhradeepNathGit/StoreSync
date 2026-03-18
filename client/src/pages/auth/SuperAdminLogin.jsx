import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { ShieldCheck, Eye, EyeOff, Store } from "lucide-react";
import Logo from "../../components/common/Logo";

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Email and password are required");
            return;
        }
        try {
            setLoading(true);
            const res = await api.post("/auth/login", { email, password });
            const { accessToken, refreshToken, user } = res.data;

            if (user.role !== "super_admin") {
                toast.error("Access denied. Super Admin credentials required.");
                return;
            }

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            toast.success("Welcome back, Platform Administrator!");
            navigate("/admin/dashboard");
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 h-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/inventoryadmin.jpg')" }}
                ></div>
                {}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute top-12 left-12">
                    <Logo />
                </div>

                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Portal</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Admin Access</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">Platform administrative portal. Manage global operations, monitor system health, and oversee all registered stores.</p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-white">
                <div className="w-full max-w-sm">
                    {}
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span>StoreSync</span>
                            <span className="text-slate-900">Admin</span>
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 font-medium">Please enter your administrative credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm hover:border-slate-300"
                                    placeholder="admin@mystore.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm hover:border-slate-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/30 transition-all duration-200 shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Sign In to Admin Portal"}
                        </button>
                    </form>

                    <div className="mt-12 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400">
                            <ShieldCheck className="w-5 h-5" />
                            <p className="text-xs font-medium leading-relaxed">
                                This portal is restricted. All login attempts are logged and monitored for security purposes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;

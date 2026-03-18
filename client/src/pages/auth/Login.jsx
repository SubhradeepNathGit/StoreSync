import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthContext from "../../context/AuthContext";
import { Eye, EyeOff, Store } from "lucide-react";
import Logo from "../../components/common/Logo";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        await login(data.email, data.password, "team");
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 h-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/Inventory5.jpg')" }}
                ></div>
                {}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-12 left-12">
                    <Logo />
                </div>
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Welcome Back</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg shadow-black/20">Access your dashboard to effortlessly manage products, track inventory, and oversee operations across your store.</p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-sm">
                    {}
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-black/60 tracking-tight flex items-center gap-2 justify-center lg:justify-start">
                            <span>Welcome to</span>
                            <Store className="w-8 h-8 text-black/60" />StoreSync
                        </h2>
                        <p className="mt-2 -mb-2 text-sm text-slate-400 font-medium">Please sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    {...register("email", { required: "Email is required" })}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.email ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    placeholder="name@company.com"
                                />
                                {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("password", { required: "Password is required" })}
                                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.password ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
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
                                {errors.password && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/30 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center lg:text-left">
                        <p className="text-sm font-medium text-slate-500">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-bold text-slate-600 hover:text-black transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Login;

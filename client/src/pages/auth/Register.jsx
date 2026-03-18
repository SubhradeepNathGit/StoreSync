import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthContext from "../../context/AuthContext";
import { Eye, EyeOff, ChevronDown, Check, Store, Users } from "lucide-react";
import Logo from "../../components/common/Logo";

const Register = () => {
    const { register: registerUser } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { role: "owner" }
    });

    const navigate = useNavigate();
    
    const currentRole = watch("role");
    
    const passwordValue = watch("password");

    const roles = [
        { id: "owner", title: "Store Owner", desc: "Create a new shop", icon: Store },
        { id: "manager", title: "Store Manager", desc: "Join an existing shop", icon: Users }
    ];

    const onSubmit = async (data) => {
        try {
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                shopName: data.shopName
            });
            navigate("/verify-email", { state: { email: data.email } });
        } catch {
            
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 h-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/Inventory2.jpg')" }}
                ></div>
                {}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-12 left-12">
                    <Logo />
                </div>
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Create Account</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">Join StoreSync to start managing your inventory with precision and scale your business with ease.</p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto py-12">
                <div className="w-full max-w-sm">
                    {}
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                            Create Account
                        </h2>
                        <p className="mt-2 -mb-2 text-sm text-slate-400 font-medium">Select your role and get started</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            {}
                            <div className="space-y-1.5 z-10 relative">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration Role</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleOpen(!isRoleOpen)}
                                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-sm font-medium shadow-sm flex items-center justify-between text-left ${errors.role ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {roles.find(r => r.id === currentRole)?.icon && (
                                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600">
                                                    {(() => {
                                                        const Icon = roles.find(r => r.id === currentRole).icon;
                                                        return <Icon className="w-4 h-4" />;
                                                    })()}
                                                </div>
                                            )}
                                            <span className="text-slate-900 font-bold">
                                                {roles.find(r => r.id === currentRole)?.title || "Select Role"}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isRoleOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsRoleOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top p-1.5">
                                                {roles.map(role => (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setValue("role", role.id);
                                                            setIsRoleOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-center justify-between ${currentRole === role.id
                                                            ? 'bg-indigo-50 text-indigo-700'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${currentRole === role.id ? 'bg-indigo-100/50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                <role.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${currentRole === role.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                                                                    {role.title}
                                                                </p>
                                                                <p className={`text-[10px] font-medium ${currentRole === role.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                                    {role.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {currentRole === role.id && <Check className="w-4 h-4 text-indigo-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <input type="hidden" {...register("role", { required: "Role is required" })} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shop Name</label>
                                <input
                                    type="text"
                                    {...register("shopName", { required: "Shop name is required" })}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.shopName ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    placeholder={currentRole === "owner" ? "Enter your new shop name" : "Enter existing shop name"}
                                />
                                {errors.shopName && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.shopName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    {...register("name", { required: "Full name is required" })}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.name ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.email ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    placeholder="name@company.com"
                                />
                                {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: { value: 6, message: "Min 6 chars" }
                                            })}
                                            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.password ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.password.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm</label>
                                    <input
                                        type="password"
                                        {...register("confirmPassword", {
                                            required: "Required",
                                            validate: (val) => passwordValue === val || "Match fail"
                                        })}
                                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/30 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95"
                        >
                            {isSubmitting ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-slate-900 hover:text-indigo-600 transition-colors underline decoration-slate-200 underline-offset-4">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

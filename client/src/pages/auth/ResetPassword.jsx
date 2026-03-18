import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../../components/common/Logo";

const ResetPassword = () => {
    const { resetToken } = useParams();
    const { resetPassword } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch
    } = useForm();

    const onSubmit = async (data) => {
        try {
            await resetPassword(resetToken, data.password);
            
        } catch {
            
        }
    };
    
    const passwordValue = watch('password');

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 h-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/Inventory.png')" }}
                ></div>
                {}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-12 left-12">
                    <Logo />
                </div>
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Security Update</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">Choose a strong, unique password to ensure the security of your StoreSync operations.</p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-sm">
                    {}
                    <div className="mb-10 text-center lg:text-left">

                        <h2 className="text-3xl font-bold text-black/60 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                            Set New Password
                        </h2>
                        <p className="mt-2 -mb-2 text-sm text-slate-400 font-medium">Enter your new secure password below</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters"
                                            }
                                        })}
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

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        {...register("confirmPassword", {
                                            required: "Please confirm your password",
                                            validate: (val) => {
                                                if (passwordValue != val) {
                                                    return "Your passwords do not match";
                                                }
                                            }
                                        })}
                                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-sm font-medium placeholder-slate-400 shadow-sm ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/30 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? "Resetting..." : "Confirm Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

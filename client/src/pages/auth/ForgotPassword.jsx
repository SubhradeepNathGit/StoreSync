import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import Logo from "../../components/common/Logo";

const ForgotPassword = () => {
    const { forgotPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            await forgotPassword(data.email);
            navigate("/email-sent", { state: { email: data.email } });
        } catch {
            
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 h-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/Inventory4.jpg')" }}
                ></div>
                {}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute top-12 left-12">
                    <Logo />
                </div>

                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <div className="flex items-center gap-3 mb-4">
                       
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Account Recovery</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Recover Access</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
                        Don't worry, we'll help you securely reset your password and get back to managing your store operations quickly.
                    </p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-white">
                <div className="w-full max-w-sm">
                    {}
                    <div className="mb-10 text-center lg:text-left">
                        <div className="inline-flex lg:hidden mb-6">
                            <Logo />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                            Password Reset
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 font-medium">Enter your email for a secure reset link</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/30 transition-all duration-200 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Processing Request..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-8">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

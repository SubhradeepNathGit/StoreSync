import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import Logo from "../../components/common/Logo";
import AuthContext from "../../context/AuthContext";

const EmailSent = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { forgotPassword } = useContext(AuthContext);
    const [sending, setSending] = useState(false);
    const email = state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleResend = async () => {
        if (sending || !email) return;
        setSending(true);
        try {
            await forgotPassword(email);
            
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 h-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/Inventory3.jpg')" }}
                ></div>
                {}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-12 left-12">
                    <Logo />
                </div>
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Check Your Inbox</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">We've sent a secure recovery link. Follow the instructions in the email to regain access to your account.</p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-sm text-center">


                    <h2 className="text-3xl font-bold text-black/60 tracking-tight mb-4">Secure Link Sent</h2>
                    <p className="text-sm font-medium text-slate-400 mb-10 leading-relaxed">
                        We've securely sent a reset link to <span className="font-bold text-slate-900">{email}</span>. <br />Please verify your inbox to proceed.
                    </p>

                    <div className="space-y-6">
                        <Link
                            to="/login"
                            className="block w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/30 transition-all duration-200 shadow-md"
                        >
                            Return to Login
                        </Link>

                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-sm font-medium text-slate-500">
                                Email not received?{" "}
                                <button
                                    onClick={handleResend}
                                    disabled={sending}
                                    className="text-slate-600 font-bold cursor-pointer hover:text-black focus:outline-none transition-colors disabled:opacity-50 ml-1"
                                >
                                    {sending ? "Retransmitting..." : "Send Again"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailSent;

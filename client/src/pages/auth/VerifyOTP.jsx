import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";
import Logo from "../../components/common/Logo";

const VerifyOTP = () => {
    const { verifyOtp, resendOtp } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(179); 
    const [canResend, setCanResend] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

    
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    
    useEffect(() => {
        if (otp.length === 6) {
            handleVerify();
        }
        
    }, [otp]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (verifying) return;

        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setVerifying(true);
            await verifyOtp(email, otp);
            toast.success("Email verified! Please login.");
            navigate("/login");
        } catch (error) {
            setVerifying(false);
            console.error("Verification failed", error);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp(email);
            setTimeLeft(60);
            setCanResend(false);
        } catch (error) {
            
            console.error("Resend failed", error);
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
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute top-12 left-12">
                    <Logo />
                </div>
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">Secure Verification</h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">Enter the code sent to your email to securely confirm your identity and protect your StoreSync account.</p>
                </div>
            </div>

            {}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-sm">
                    {}
                    <div className="mb-10 text-center lg:text-left">

                        <h2 className="text-3xl font-bold text-black/60 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                            Verify Your Identity
                        </h2>
                        <p className="mt-2 -mb-2 text-sm text-slate-400 font-medium">Enter the 6-digit OTP sent to <span className="text-slate-900 font-semibold">{email}</span></p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label
                                htmlFor="otp"
                                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 lg:text-left text-center"
                            >
                                Security Code
                            </label>
                            <input
                                type="text"
                                id="otp"
                                maxLength="6"
                                autoFocus
                                disabled={verifying}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none text-slate-900 text-center text-sm font-medium placeholder-slate-400 shadow-sm hover:border-slate-300 disabled:opacity-50"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value.replace(/\D/g, ""))
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/30 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {verifying ? "Verifying..." : "Confirm Identity"}
                        </button>
                    </form>

                    <div className="mt-8 text-center lg:text-left">
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                className="text-sm font-bold text-slate-600 hover:text-black transition-colors"
                            >
                                Resend OTP Code
                            </button>
                        ) : (
                            <p className="text-sm font-medium text-slate-500">
                                Resend code in{" "}
                                <span className="font-bold text-slate-600">
                                    {formatTime(timeLeft)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;

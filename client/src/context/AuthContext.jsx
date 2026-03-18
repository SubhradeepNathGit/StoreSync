import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("accessToken") || "");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const logout = useCallback(async () => {
        
        const isSessionActive = !!localStorage.getItem("accessToken");

        if (!isSessionActive) {
            
            setToken("");
            setUser(null);
            navigate("/login");
            return;
        }

        try {
            await api.get("/auth/logout");
        } catch (e) {
            console.log("Logout api error", e);
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setToken("");
        setUser(null);
        navigate("/login");
        toast.info("Logged out");
    }, [navigate]);

    useEffect(() => {
        const handleAuthError = () => {
            logout();
        };

        window.addEventListener("auth-error", handleAuthError);

        const initAuth = async () => {
            if (token && !user) { 
                try {
                    const { data } = await api.get("/auth/me");
                    setUser(data.data);
                } catch (error) {
                    console.error("Auth init error", error);
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    setToken("");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();

        return () => {
            window.removeEventListener("auth-error", handleAuthError);
        };
    }, [token, user, logout]);

    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { accessToken, refreshToken, user: userData } = response.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            setToken(accessToken);
            setUser(userData);

            toast.success("Login successful!");

            
            if (userData.role === "super_admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (error) {
            
            const message = error.response?.data?.message || error.message || "Login failed";
            toast.error(message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post("/auth/register", userData);
            toast.success(response.data.message || "OTP sent to your email!");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
            throw error;
        }
    };

    const rolesPermissions = {
        super_admin: ["create_product", "read_product", "update_product", "delete_product", "restore_product", "permanently_delete_product", "view_tasks", "create_task", "update_task", "delete_task", "view_platform_metrics"],
        owner: ["create_product", "read_product", "update_product", "delete_product", "view_tasks", "create_task", "update_task", "delete_task"],
        manager: ["create_product", "read_product", "update_product", "delete_product", "restore_product", "view_tasks", "create_task", "update_task"],
        employee: ["create_product", "read_product", "update_product", "delete_product", "restore_product", "view_tasks", "update_task_status"]
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        const userRole = (user.role || "owner").toLowerCase();
        const permissions = rolesPermissions[userRole] || [];
        return permissions.includes(permission);
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await api.post("/auth/verify-email", { email, otp });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
            throw error;
        }
    };

    const resendOtp = async (email) => {
        try {
            const response = await api.post("/auth/resend-otp", { email });
            toast.success("OTP resent successfully");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Resend failed");
            throw error;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await api.post("/auth/forgotpassword", { email });
            toast.success("Password reset email sent!");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send email");
            throw error;
        }
    };

    const resetPassword = async (token, password) => {
        try {
            const response = await api.put(`/auth/resetpassword/${token}`, { password });
            toast.success("Password reset successful!");
            navigate("/login");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed");
            throw error;
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            const response = await api.put("/auth/updatepassword", { currentPassword, newPassword });
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            setToken(accessToken);
            setUser(user);

            toast.success("Password updated successfully!");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
            throw error;
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                hasPermission,
                verifyOtp,
                resendOtp,
                forgotPassword,
                resetPassword,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import EmailSent from "../pages/auth/EmailSent";
import ResetPassword from "../pages/auth/ResetPassword";
import Profile from "../pages/profile/Profile";
import Home from "../pages/products/Home";
import AddProduct from "../pages/products/AddProduct";
import EditProduct from "../pages/products/EditProduct";
import ProductDetail from "../pages/products/ProductDetail";
import EmployeeManagement from "../pages/admin/EmployeeManagement";
import ManagerManagement from "../pages/admin/ManagerManagement";
import SuperAdminLogin from "../pages/auth/SuperAdminLogin";
import SuperAdminDashboard from "../pages/admin/SuperAdminDashboard";
import ManageShops from "../pages/admin/ManageShops";
import Analytics from '../pages/admin/Analytics';
import Tasks from '../pages/tasks/Tasks';



import PrivateRoute from "../components/auth/PrivateRoute";

const Routing = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/email-sent" element={<EmailSent />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

            {}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/product-listing" element={<PrivateRoute><Home /></PrivateRoute>} />

            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/employees" element={<PrivateRoute><EmployeeManagement /></PrivateRoute>} />
            <Route path="/managers" element={<PrivateRoute><ManagerManagement /></PrivateRoute>} />
            <Route path="/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
            <Route path="/edit-product/:id" element={<PrivateRoute><EditProduct /></PrivateRoute>} />
            <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />


            {}
            <Route path="/admin" element={<SuperAdminLogin />} />
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/shops" element={<ManageShops />} />
            <Route path="/admin/analytics" element={<Analytics />} />

            {}
            <Route
                path="*"
                element={
                    <div className="text-center mt-20 text-red-500 text-xl font-bold">
                        404 - Page Not Found
                    </div>
                }
            />
        </Routes>
    );
};

export default Routing;

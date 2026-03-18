import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await api.put("/users/update-password", passwordData);
            toast.success("Password updated successfully");
            setPasswordData({ currentPassword: "", newPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update password");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Logout</button>
                </div>

                <div className="p-6">
                    <div className="flex items-center space-x-6 mb-6">
                        <img
                            src={user?.profileImage || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold">{user?.name}</h2>
                            <p className="text-gray-600">{user?.email}</p>
                        </div>
                    </div>

                    <hr className="my-6" />

                    <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 mt-1 border rounded-md"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 mt-1 border rounded-md"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

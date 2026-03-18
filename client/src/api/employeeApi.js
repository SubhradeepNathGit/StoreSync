import axiosInstance from './axiosInstance';

const employeeApi = {
    
    createEmployee: async (employeeData) => {
        const response = await axiosInstance.post('/employees', employeeData);
        return response.data;
    },

    
    getEmployees: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.role) params.append('role', filters.role);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
        if (filters.search) params.append('search', filters.search);

        const response = await axiosInstance.get(`/employees?${params.toString()}`);
        return response.data;
    },

    
    getEmployeeById: async (id) => {
        const response = await axiosInstance.get(`/employees/${id}`);
        return response.data;
    },

    
    toggleEmployeeStatus: async (id) => {
        const response = await axiosInstance.patch(`/employees/${id}/toggle`);
        return response.data;
    },

    
    resetEmployeePassword: async (id) => {
        const response = await axiosInstance.post(`/employees/${id}/reset-password`);
        return response.data;
    },

    
    deleteEmployee: async (id) => {
        const response = await axiosInstance.delete(`/employees/${id}`);
        return response.data;
    },
};

export default employeeApi;

import axiosInstance from "./axiosInstance";

export const getTasks = async (params = {}) => {
  const response = await axiosInstance.get("/tasks", { params });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await axiosInstance.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axiosInstance.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.patch(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};

export const getPlatformTaskMetrics = async () => {
  const response = await axiosInstance.get("/tasks/platform-metrics");
  return response.data;
};
export const getUnreadCount = async () => {
  const response = await axiosInstance.get("/tasks/unread-count");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`/tasks/${id}/read`);
  return response.data;
};

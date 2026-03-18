import axiosInstance from "./axiosInstance";

export const getAllShops = async () => {
  const response = await axiosInstance.get("/admin/shops");
  return response.data;
};

export const getPlatformMetrics = async () => {
  const response = await axiosInstance.get("/admin/metrics");
  return response.data;
};

import axiosInstance from './axiosInstance';
import API_ENDPOINTS from './endpoint';

const productApi = {

  getAllProducts: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_ALL, { params });
    
    if (res.data.success && res.data.data) {
      return {
        data: res.data.data.products,
        totalPages: res.data.data.totalPages,
        totalProducts: res.data.data.totalProducts
      };
    }
    return res.data;
  },


  getProductById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
    return res.data.data;
  },


  createProduct: async (formData) => {
    const res = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.CREATE, formData);
    return res.data;
  },

  importProducts: async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    const res = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.CREATE + "/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, 
    });
    return res.data;
  },

  updateProduct: async (id, formData) => {
    const res = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
    return res.data;
  },

  forceDeleteProduct: async (id) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id) + "/force");
    return res.data;
  },

  bulkDeleteProducts: async () => {
    const res = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.BULK_DELETE);
    return res.data;
  },

  restoreProduct: async (id) => {
    const res = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.UPDATE(id) + "/restore");
    return res.data;
  },

  getMetrics: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_METRICS);
    return res.data.data;
  },

  
  getAllCategories: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
    return res.data.data;
  },

  getAllCategoriesWithSubcategories: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL_WITH_SUB);
    return res.data.data;
  },

  getSubcategories: async (categoryId) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_SUB(categoryId));
    return res.data.data;
  },

  deleteCategory: async (categoryId) => {
    const res = await axiosInstance.delete(`/categories/${categoryId}`);
    return res.data;
  },

  deleteSubcategory: async (subcategoryId) => {
    const res = await axiosInstance.delete(`/categories/subcategories/${subcategoryId}`);
    return res.data;
  },

  createCategory: async (data) => {
    const res = await axiosInstance.post('/categories', data);
    return res.data;
  },

  createSubcategory: async (data) => {
    
    const payload = {
      name: data.name,
      category: data.categoryId,
      group: data.group || 'General' 
    };
    const res = await axiosInstance.post('/categories/subcategories', payload);
    return res.data;
  },
};

export default productApi;

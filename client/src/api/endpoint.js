export const API_ENDPOINTS = {
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
    CREATE: '/products', 
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    BULK_DELETE: '/products/bulk/delete-all',
    GET_METRICS: '/products/metrics/stats',
  },
  CATEGORIES: {
    GET_ALL: '/categories',
    GET_ALL_WITH_SUB: '/categories/all',
    GET_SUB: (id) => `/categories/${id}/subcategories`,
  },
};

export default API_ENDPOINTS;

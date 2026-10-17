import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getWarrantyStats: async () => {
    const response = await api.get('/dashboard/warranty-stats');
    return response.data;
  },

  getCategoryStats: async () => {
    const response = await api.get('/dashboard/category-stats');
    return response.data;
  },

  getUpcomingItems: async () => {
    const response = await api.get('/dashboard/upcoming-items');
    return response.data;
  },
};

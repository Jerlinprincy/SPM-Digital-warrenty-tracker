import api from './api';

export const serviceService = {
  getServices: async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  createService: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post('/services', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateService: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.put(`/services/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

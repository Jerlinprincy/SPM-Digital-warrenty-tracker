import api from './api';

export const documentService = {
  uploadDocument: async ({ file, productId, serviceId, documentType }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (productId) formData.append('productId', productId);
    if (serviceId) formData.append('serviceId', serviceId);
    if (documentType) formData.append('documentType', documentType);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },
};

import apiClient from '../../auth/api/auth.api';

export const notificationApi = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};

export default notificationApi;

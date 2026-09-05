import apiClient from '../../auth/api/auth.api';

const API_BASE = '/notifications';

const notificationsApi = {
  getNotifications: () => apiClient.get(API_BASE),
  markAsRead: (id) => apiClient.patch(`${API_BASE}/${id}/read`),
};

export default notificationsApi;

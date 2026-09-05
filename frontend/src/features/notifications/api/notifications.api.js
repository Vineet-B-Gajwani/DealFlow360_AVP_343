import axios from 'axios';

const API_BASE = '/api/notifications';

const notificationsApi = {
  getNotifications: () => axios.get(API_BASE),
  markAsRead: (id) => axios.patch(`${API_BASE}/${id}/read`),
};

export default notificationsApi;

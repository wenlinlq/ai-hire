import api from './api';

// 通知相关API
export const notificationApi = {
  // 获取用户的通知列表
  getUserNotifications: (userId: string) => {
    return api.get(`/notifications/user/${userId}`);
  },

  // 获取用户的未读通知
  getUnreadNotifications: (userId: string) => {
    return api.get(`/notifications/user/${userId}/unread`);
  },

  // 标记通知为已读
  markAsRead: (notificationId: string) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  // 标记所有通知为已读
  markAllAsRead: (userId: string) => {
    return api.put(`/notifications/user/${userId}/read-all`);
  },

  // 删除通知
  deleteNotification: (notificationId: string) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  // 获取通知详情
  getNotificationById: (notificationId: string) => {
    return api.get(`/notifications/${notificationId}`);
  },
};
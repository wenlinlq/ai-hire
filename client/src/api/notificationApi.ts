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

  // 发送通知
  sendNotification: (notificationData: any) => {
    return api.post(`/notifications/send`, notificationData);
  },
};

// 通知模板相关API
export const notificationTemplateApi = {
  // 获取团队的通知模板列表
  getTeamTemplates: (teamId: string) => {
    return api.get(`/notification-templates/team/${teamId}`);
  },

  // 获取系统默认模板
  getDefaultTemplates: () => {
    return api.get('/notification-templates/default');
  },

  // 获取模板详情
  getTemplateById: (templateId: string) => {
    return api.get(`/notification-templates/${templateId}`);
  },

  // 获取特定类型的模板
  getTemplateByType: (teamId: string, type: string) => {
    return api.get(`/notification-templates/team/${teamId}/type/${type}`);
  },

  // 创建新模板
  createTemplate: (templateData: any) => {
    return api.post('/notification-templates', templateData);
  },

  // 更新模板
  updateTemplate: (templateId: string, templateData: any) => {
    return api.put(`/notification-templates/${templateId}`, templateData);
  },

  // 删除模板
  deleteTemplate: (templateId: string, data: any) => {
    return api.delete(`/notification-templates/${templateId}`, { data });
  },
};
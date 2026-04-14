import api from './api';

// 面试邀请相关API
export const interviewInvitationApi = {
  // 创建面试邀请
  createInterviewInvitation: (data: {
    deliveryId: string;
    userId: string;
    interviewerId?: string;
    round?: number;
    type: 'online' | 'offline';
    scheduledTime: string;
    meetingUrl?: string;
    location?: string;
  }) => {
    return api.post('/interviewInvitations', data);
  },

  // 获取用户的面试邀请
  getUserInterviewInvitations: (userId: string) => {
    return api.get(`/interviewInvitations/user/${userId}`);
  },

  // 获取面试邀请详情
  getInterviewInvitationById: (invitationId: string) => {
    return api.get(`/interviewInvitations/${invitationId}`);
  },

  // 更新面试邀请状态
  updateInterviewInvitationStatus: (invitationId: string, data: {
    status?: string;
    result?: 'pass' | 'fail' | 'pending';
    evaluation?: any;
    userFeedback?: 'pending' | 'confirmed' | 'declined';
  }) => {
    return api.put(`/interviewInvitations/${invitationId}/status`, data);
  },

  // 用户确认面试邀请
  confirmInterviewInvitation: (invitationId: string, data: {
    userFeedback: 'confirmed' | 'declined';
  }) => {
    return api.put(`/interviewInvitations/${invitationId}/confirm`, data);
  },
};
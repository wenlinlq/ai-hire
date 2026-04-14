import api from './api';

// 投递相关API
export const deliveryApi = {
  // 创建投递记录
  createDelivery: (data: {
    userId: string;
    jobId: string;
    resumeId: string;
    hasAiPreInterview: boolean;
  }) => {
    return api.post('/deliveries', data);
  },

  // 获取用户的投递记录
  getUserDeliveries: (userId: string) => {
    return api.get(`/deliveries/user/${userId}`);
  },

  // 获取投递记录详情
  getDeliveryById: (deliveryId: string) => {
    return api.get(`/deliveries/${deliveryId}`);
  },

  // 更新投递记录状态
  updateDeliveryStatus: (deliveryId: string, data: {
    status: string;
    aiScore?: number;
  }) => {
    return api.put(`/deliveries/${deliveryId}/status`, data);
  },
};
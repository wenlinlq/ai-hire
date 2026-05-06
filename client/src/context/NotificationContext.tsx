import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import userApi from "../api/userApi";
import { notificationApi } from "../api/notificationApi";
import { aiPreInterviewApi } from "../api/aiPreInterviewApi";
import { interviewInvitationApi } from "../api/interviewInvitationApi";

interface NotificationContextType {
  messageCount: number;
  profileCount: number;
  totalCount: number;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [messageCount, setMessageCount] = useState(0);
  const [profileCount, setProfileCount] = useState(0);

  const fetchNotificationData = useCallback(async () => {
    const currentUser = userApi.getCurrentUser();
    if (!currentUser) {
      setMessageCount(0);
      setProfileCount(0);
      return;
    }

    try {
      const unreadNotificationData =
        await notificationApi.getUnreadNotifications(currentUser._id);
      const newMessageCount = unreadNotificationData.data?.length || 0;

      const aiPreInterviewData = await aiPreInterviewApi.getUserAiPreInterviews(
        currentUser._id,
      );
      const aiPreInterviewCount =
        aiPreInterviewData.data?.filter(
          (item: any) => item.status !== "completed",
        ).length || 0;

      const interviewInvitationData =
        await interviewInvitationApi.getUserInterviewInvitations(
          currentUser._id,
        );
      const interviewInvitationCount =
        interviewInvitationData.data?.length || 0;
      const newProfileCount = aiPreInterviewCount + interviewInvitationCount;

      setMessageCount(newMessageCount);
      setProfileCount(newProfileCount);
    } catch (error) {
      console.error("获取通知数据失败:", error);
    }
  }, []);

  useEffect(() => {
    // 首次加载时获取通知数据
    fetchNotificationData();

    // 定时刷新通知数据，每30秒更新一次
    const interval = setInterval(() => {
      fetchNotificationData();
    }, 30000); // 30秒

    // 清理定时器
    return () => {
      clearInterval(interval);
    };
  }, [fetchNotificationData]);

  const refreshNotifications = useCallback(() => {
    fetchNotificationData();
  }, [fetchNotificationData]);

  const contextValue = useMemo(
    () => ({
      messageCount,
      profileCount,
      totalCount: messageCount + profileCount,
      refreshNotifications,
    }),
    [messageCount, profileCount, refreshNotifications],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

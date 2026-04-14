import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";
import userApi from "../../api/userApi";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: string;
  teamName?: string;
}

function NotificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        // 从API获取通知详情
        const response = await notificationApi.getNotificationById(id!);
        const notificationData = response.data;
        // 将_id字段重命名为id
        const notificationWithId = {
          ...notificationData,
          id: notificationData._id,
        };
        setNotification(notificationWithId);
      } catch (error) {
        console.error("获取通知详情失败:", error);
        setNotification(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "system":
        return (
          <svg
            className="h-6 w-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "application":
        return (
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "interview":
        return (
          <svg
            className="h-6 w-6 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "offer":
        return (
          <svg
            className="h-6 w-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "system":
        return "系统通知";
      case "application":
        return "投递成功";
      case "interview":
        return "面试邀请";
      case "offer":
        return "录用通知";
      default:
        return "其他";
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case "system":
        return "bg-blue-100 text-blue-700";
      case "application":
        return "bg-green-100 text-green-700";
      case "interview":
        return "bg-purple-100 text-purple-700";
      case "offer":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500">加载中...</div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-neutral-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-lg text-neutral-500">通知不存在</p>
          <button
            onClick={() => navigate("/notifications")}
            className="mt-4 rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-600 transition-colors"
          >
            返回通知列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/notifications")}
          className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          返回通知列表
        </button>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-neutral-800">
                  {notification.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  {notification.teamName && (
                    <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      来自团队: {notification.teamName}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeClass(
                      notification.type,
                    )}`}
                  >
                    {getTypeLabel(notification.type)}
                  </span>
                  <span className="text-neutral-500">
                    {notification.createdAt}
                  </span>
                  {notification.isRead ? (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      已读
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-primary-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      未读
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="prose max-w-none text-neutral-700 leading-relaxed">
              {notification.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                发送者: {notification.sender}
              </span>
              <div className="flex gap-3">
                {!notification.isRead && (
                  <button
                    onClick={() => {
                      setNotification({ ...notification, isRead: true });
                    }}
                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                  >
                    标记为已读
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationDetail;

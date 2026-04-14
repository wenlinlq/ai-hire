import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "../../components/site";
import userApi from "../../api/userApi";
import { notificationApi } from "../../api/notificationApi";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "system" | "application" | "interview" | "offer";
  isRead: boolean;
  createdAt: string;
  teamName?: string;
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(false);

  // 获取通知数据
  useEffect(() => {
    const fetchNotifications = async () => {
      const user = userApi.getCurrentUser();
      if (!user) return;

      try {
        setLoading(true);
        // 获取用户的所有通知
        const notificationData = await notificationApi.getUserNotifications(
          user._id,
        );
        // 将_id字段重命名为id，确保每个通知对象都有唯一的id字段
        const notificationsWithId = (notificationData.data || []).map(
          (notification) => ({
            ...notification,
            id: notification._id,
          }),
        );
        setNotifications(notificationsWithId);
      } catch (error) {
        console.error("获取通知数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      // 调用API标记通知为已读
      await notificationApi.markAsRead(id);
      // 更新本地状态
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("标记通知为已读失败:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = userApi.getCurrentUser();
      if (!user) return;

      // 调用API标记所有通知为已读
      await notificationApi.markAllAsRead(user._id);
      // 更新本地状态
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("标记所有通知为已读失败:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // 调用API删除通知
      await notificationApi.deleteNotification(id);
      // 更新本地状态
      setNotifications(
        notifications.filter((notification) => notification.id !== id),
      );
    } catch (error) {
      console.error("删除通知失败:", error);
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "system":
        return (
          <svg
            className="h-5 w-5 text-blue-500"
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
            className="h-5 w-5 text-green-500"
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
            className="h-5 w-5 text-purple-500"
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
            className="h-5 w-5 text-yellow-500"
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <SiteNav current="profile" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">消息通知</h1>
          <p className="mt-2 text-neutral-600">
            查看您的系统通知、投递状态、面试邀请等信息
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              全部通知
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filter === "unread"
                  ? "bg-primary-500 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              未读 ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              全部标记为已读
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-4 text-lg text-neutral-500">
                {filter === "unread" ? "暂无未读通知" : "暂无通知"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Link
                key={notification.id}
                to={`/notifications/${notification.id}`}
                className={`block rounded-lg border p-6 shadow-sm transition-all ${
                  notification.isRead
                    ? "border-neutral-200 bg-white"
                    : "border-primary-200 bg-primary-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-800">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                      <p className="mb-3 text-neutral-600">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        {notification.teamName && (
                          <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                            来自: {notification.teamName}
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
                          {new Date(notification.createdAt).toLocaleString(
                            "zh-CN",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkAsRead(notification.id);
                        }}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                      >
                        标记已读
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(notification.id);
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;

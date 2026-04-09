import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "system" | "application" | "interview" | "offer";
  isRead: boolean;
  createdAt: string;
  sender: string;
}

function NotificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "简历投递成功",
        content:
          "您已成功投递前端开发工程师职位，请耐心等待面试通知。我们会在收到您的简历后尽快进行筛选，并通过邮件或短信通知您面试安排。",
        type: "application",
        isRead: false,
        createdAt: "2024-01-15 10:30",
        sender: "系统",
      },
      {
        id: "2",
        title: "面试邀请",
        content:
          "ABC科技有限公司邀请您参加前端开发工程师职位的面试，时间：2024-01-20 14:00。面试地点：北京市朝阳区科技园区A座3楼会议室。请携带个人简历、身份证复印件及相关作品集。如有疑问请联系：hr@abctech.com",
        type: "interview",
        isRead: false,
        createdAt: "2024-01-14 15:20",
        sender: "ABC科技有限公司",
      },
      {
        id: "3",
        title: "系统通知",
        content:
          "您的简历已被查看，请保持手机畅通，可能会有HR联系您。建议您定期更新简历信息，以提高被录用的机会。",
        type: "system",
        isRead: true,
        createdAt: "2024-01-13 09:15",
        sender: "系统",
      },
      {
        id: "4",
        title: "录用通知",
        content:
          "恭喜您！XYZ科技公司决定录用您为前端开发工程师，请及时确认录用通知。入职时间：2024-02-01。请于收到本通知后3个工作日内确认是否接受录用，并准备相关入职材料。如有疑问请联系：recruit@xyztech.com",
        type: "offer",
        isRead: true,
        createdAt: "2024-01-10 16:45",
        sender: "XYZ科技公司",
      },
      {
        id: "5",
        title: "系统维护通知",
        content:
          "系统将于2024-01-18 02:00-04:00进行维护，期间部分功能可能无法使用。维护完成后，所有功能将恢复正常。给您带来的不便，敬请谅解。",
        type: "system",
        isRead: true,
        createdAt: "2024-01-08 11:00",
        sender: "系统",
      },
    ];

    const found = mockNotifications.find((n) => n.id === id);
    setNotification(found || null);
    setLoading(false);
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

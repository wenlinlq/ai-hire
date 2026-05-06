import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { aiPreInterviewApi } from "../../api/aiPreInterviewApi";
import { interviewInvitationApi } from "../../api/interviewInvitationApi";

type ProfileTab = "profile" | "resume" | "myInterviews" | "favorites";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [interviewCount, setInterviewCount] = useState(0);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = userApi.getCurrentUser();
      if (!user) return;

      try {
        const userData = await userApi.getUserById(user._id);
        setProfileForm({
          name: userData.username || "",
          email: userData.email || "",
        });

        const [aiPreInterviewData, invitationData] = await Promise.all([
          aiPreInterviewApi.getUserAiPreInterviews(user._id),
          interviewInvitationApi.getUserInterviewInvitations(user._id),
        ]);

        const pendingAiInterviews =
          aiPreInterviewData.data?.filter(
            (interview: any) => interview.status !== "completed",
          ).length || 0;
        const totalInterviews =
          pendingAiInterviews + (invitationData.data?.length || 0);
        setInterviewCount(totalInterviews);
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchUserData();
  }, []);

  const getActiveTab = (): ProfileTab => {
    const path = location.pathname;
    if (path.includes("/profile/resume")) return "resume";
    if (path.includes("/profile/interviews")) return "myInterviews";
    if (path.includes("/profile/favorites")) return "favorites";
    return "profile";
  };

  const activeTab = getActiveTab();

  const tabItems: { key: ProfileTab; label: string; path: string }[] = [
    { key: "profile", label: "个人信息", path: "/profile" },
    { key: "resume", label: "我的简历", path: "/profile/resume" },
    { key: "myInterviews", label: "我的面试", path: "/profile/interviews" },
    { key: "favorites", label: "收藏岗位", path: "/profile/favorites" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回
          </button>
        </div>
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm h-[calc(100vh-150px)]">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500">
                  <svg
                    className="h-10 w-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-800">
                  {profileForm.name || "用户"}
                </h3>
                <p className="text-sm text-neutral-500">
                  {profileForm.email || "未设置邮箱"}
                </p>
              </div>

              <nav className="space-y-2">
                {tabItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`block w-full rounded-lg px-4 py-3 text-left transition-colors ${
                      activeTab === item.key
                        ? "bg-primary-500 text-white"
                        : "hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {item.label}
                      {item.key === "myInterviews" && interviewCount > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                          {interviewCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

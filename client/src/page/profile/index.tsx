import { ChangeEvent, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import type { User } from "../../api/userApi";
import favoriteApi from "../../api/favoriteApi";
import positionApi from "../../api/positionApi";
import type { Position } from "../../api/positionApi";
import resumeApi from "../../api/resumeApi";
import type { Resume } from "../../api/resumeApi";
import { deliveryApi } from "../../api/deliveryApi";
import { aiPreInterviewApi } from "../../api/aiPreInterviewApi";
import { interviewInvitationApi } from "../../api/interviewInvitationApi";
import { notificationApi } from "../../api/notificationApi";

type ProfileTab =
  | "profile"
  | "resume"
  | "myInterviews"
  | "favorites"
  | "interviews";

type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  grade: string;
  intro: string;
  _id: string;
};

type ResumeItem = {
  name: string;
  uploadedAt: string;
  type: "PDF" | "DOC" | "DOCX" | "JPG" | "PNG";
  _id: string;
  isActive: boolean;
};

type FavoriteJob = Position & {
  savedAt: string;
};

const interviewHistory = [
  {
    title: "技术面试模拟",
    time: "2024-01-15 14:30 - 15:15",
    score: 85,
    details: [
      { label: "专业知识", value: 90 },
      { label: "表达能力", value: 80 },
      { label: "应变能力", value: 85 },
    ],
  },
  {
    title: "综合面试模拟",
    time: "2024-01-10 10:00 - 10:45",
    score: 78,
    details: [
      { label: "专业知识", value: 75 },
      { label: "表达能力", value: 82 },
      { label: "应变能力", value: 77 },
    ],
  },
  {
    title: "产品面试模拟",
    time: "2024-01-05 16:00 - 16:40",
    score: 88,
    details: [
      { label: "专业知识", value: 84 },
      { label: "表达能力", value: 91 },
      { label: "应变能力", value: 89 },
    ],
  },
] as const;

function Profile() {
  // 从localStorage读取初始tab状态
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    const savedTab = localStorage.getItem("profileActiveTab");
    return (savedTab as ProfileTab) || "profile";
  });

  const navigate = useNavigate();

  // 面试数量状态
  const [interviewCount, setInterviewCount] = useState(0);
  // 总通知数量状态
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    email: "",
    grade: "",
    intro: "",
    _id: "",
  });
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [favoriteJobs, setFavoriteJobs] = useState<FavoriteJob[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [aiPreInterviews, setAiPreInterviews] = useState<any[]>([]);
  const [interviewInvitations, setInterviewInvitations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const averageScore = useMemo(
    () =>
      Math.round(
        interviewHistory.reduce((sum, item) => sum + item.score, 0) /
          interviewHistory.length,
      ),
    [],
  );

  // 获取用户信息
  useEffect(() => {
    const user = userApi.getCurrentUser();
    if (user) {
      // 处理手机号，4-7位用*隐藏
      let maskedPhone = user.phone || "";
      if (maskedPhone.length === 11) {
        maskedPhone =
          maskedPhone.substring(0, 3) + "****" + maskedPhone.substring(7);
      }

      setProfileForm({
        name: user.username || "",
        phone: maskedPhone,
        email: user.email || "",
        grade: "", // 年级信息需要让用户填写
        intro: "",
        _id: user._id,
      });
    }
  }, []);

  // 获取收藏职位数据
  useEffect(() => {
    const fetchFavoriteJobs = async () => {
      const user = userApi.getCurrentUser();
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        // 获取用户收藏的职位ID列表
        const favoriteIds = await favoriteApi.getUserFavorites(user._id);

        if (favoriteIds.length === 0) {
          setFavoriteJobs([]);
          return;
        }

        // 获取所有职位数据
        const allPositions = await positionApi.getPositions();

        // 过滤出用户收藏的职位
        const favoriteJobsData = allPositions
          .filter((position) => favoriteIds.includes(position._id))
          .map((position) => ({
            ...position,
            savedAt: new Date().toISOString().split("T")[0], // 这里应该从收藏记录中获取实际的收藏时间
          }));

        setFavoriteJobs(favoriteJobsData);
      } catch (error) {
        console.error("获取收藏职位失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteJobs();
  }, []);

  // 获取简历数据
  useEffect(() => {
    const fetchResumes = async () => {
      const user = userApi.getCurrentUser();
      if (!user) {
        return;
      }

      try {
        setResumeLoading(true);
        // 获取用户的所有简历
        const resumeData = await resumeApi.getStudentResumes();

        // 转换为前端需要的格式
        const formattedResumes: ResumeItem[] = resumeData.map((resume) => ({
          _id: resume._id,
          name: resume.fileUrl.split("/").pop() || "resume",
          uploadedAt: new Date(resume.createdAt).toLocaleString("zh-CN"),
          type: resume.fileType.toUpperCase() as
            | "PDF"
            | "DOC"
            | "DOCX"
            | "JPG"
            | "PNG",
          isActive: resume.isActive,
        }));

        setResumes(formattedResumes);
      } catch (error) {
        console.error("获取简历数据失败:", error);
      } finally {
        setResumeLoading(false);
      }
    };

    fetchResumes();
  }, []);

  // 保存activeTab到localStorage
  useEffect(() => {
    localStorage.setItem("profileActiveTab", activeTab);
  }, [activeTab]);

  // 获取面试相关数据
  useEffect(() => {
    const fetchInterviewData = async () => {
      const user = userApi.getCurrentUser();
      if (!user) {
        return;
      }

      try {
        setInterviewLoading(true);

        // 获取用户的投递记录
        const deliveryData = await deliveryApi.getUserDeliveries(user._id);
        setDeliveries(deliveryData.data || []);

        // 获取用户的AI预面试记录
        const aiPreInterviewData =
          await aiPreInterviewApi.getUserAiPreInterviews(user._id);
        setAiPreInterviews(aiPreInterviewData.data || []);

        // 获取用户的面试邀请
        const interviewInvitationData =
          await interviewInvitationApi.getUserInterviewInvitations(user._id);
        setInterviewInvitations(interviewInvitationData.data || []);

        // 计算面试数量
        const totalInterviews =
          (aiPreInterviewData.data?.length || 0) +
          (interviewInvitationData.data?.length || 0);
        setInterviewCount(totalInterviews);
      } catch (error) {
        console.error("获取面试数据失败:", error);
      } finally {
        setInterviewLoading(false);
      }
    };

    fetchInterviewData();
  }, []);

  // 获取通知数据
  useEffect(() => {
    const fetchNotificationData = async () => {
      const user = userApi.getCurrentUser();
      if (!user) {
        return;
      }

      try {
        setNotificationLoading(true);

        // 获取用户的未读通知
        const unreadNotificationData =
          await notificationApi.getUnreadNotifications(user._id);
        setNotificationCount(unreadNotificationData.data?.length || 0);

        // 获取用户的所有通知
        const allNotificationData = await notificationApi.getUserNotifications(
          user._id,
        );
        setNotifications(allNotificationData.data || []);
      } catch (error) {
        console.error("获取通知数据失败:", error);
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotificationData();
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setResumeLoading(true);
      // 调用API上传简历
      await resumeApi.uploadResume(file);
      // 重新获取简历列表
      const user = userApi.getCurrentUser();
      if (user) {
        const resumeData = await resumeApi.getStudentResumes();
        const formattedResumes: ResumeItem[] = resumeData.map((resume) => ({
          _id: resume._id,
          name: resume.fileUrl.split("/").pop() || "resume",
          uploadedAt: new Date(resume.createdAt).toLocaleString("zh-CN"),
          type: resume.fileType.toUpperCase() as
            | "PDF"
            | "DOC"
            | "DOCX"
            | "JPG"
            | "PNG",
          isActive: resume.isActive,
        }));
        setResumes(formattedResumes);
      }
    } catch (error) {
      console.error("上传简历失败:", error);
      alert("上传简历失败，请重试");
    } finally {
      setResumeLoading(false);
      event.target.value = "";
    }
  };

  const handleChangePhone = () => {
    setNewPhone("");
    setVerificationCode("");
    setCountdown(0);
    setShowPhoneModal(true);
  };

  const handleConfirmChangePhone = () => {
    // 这里可以添加手机号和验证码验证逻辑
    if (newPhone && verificationCode) {
      // 模拟修改手机号，实际项目中应该调用API
      setProfileForm((current) => ({
        ...current,
        phone: newPhone,
      }));
      setShowPhoneModal(false);
    }
  };

  const sendVerificationCode = () => {
    // 这里可以添加手机号验证逻辑
    if (newPhone) {
      // 模拟发送验证码，实际项目中应该调用API
      console.log("发送验证码到:", newPhone);
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
                {[
                  ["profile", "个人信息"],
                  ["resume", "我的简历"],
                  ["myInterviews", "我的面试"],
                  ["favorites", "收藏岗位"],
                  ["interviews", "历史模拟面试"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                      activeTab === key
                        ? "bg-primary-500 text-white"
                        : "hover:bg-neutral-100"
                    }`}
                    onClick={() => setActiveTab(key as ProfileTab)}
                  >
                    <div className="flex items-center justify-between">
                      {label}
                      {key === "myInterviews" && interviewCount > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                          {interviewCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    个人信息
                  </h2>
                  <div className="relative">
                    <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-neutral-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                          {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <form
                  className="space-y-6"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      ["姓名", "name", "text"],
                      ["手机号", "phone", "tel"],
                      ["邮箱", "email", "email"],
                    ].map(([label, key, type]) => (
                      <div key={key} className="flex flex-col">
                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                          {label}
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type={type}
                            value={
                              profileForm[key as keyof ProfileForm] as string
                            }
                            onChange={(event) =>
                              setProfileForm((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            disabled={key === "phone"}
                            className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                          {key === "phone" && (
                            <button
                              type="button"
                              className="rounded-lg bg-primary-500 px-3 py-3 text-sm text-white transition-colors hover:bg-primary-600"
                              onClick={handleChangePhone}
                            >
                              更换手机号
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        年级
                      </label>
                      <select
                        value={profileForm.grade}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            grade: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      >
                        <option value="">请选择年级</option>
                        {["大一", "大二", "大三", "大四"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      个人简介
                    </label>
                    <textarea
                      rows={4}
                      value={profileForm.intro}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          intro: event.target.value,
                        }))
                      }
                      placeholder="介绍一下你自己..."
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
                    >
                      保存修改
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "resume" && (
              <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    我的简历
                  </h2>
                  <div className="relative">
                    <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-neutral-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                          {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center transition-colors hover:border-primary-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-lg text-neutral-600">
                    点击或拖拽上传简历
                  </p>
                  <p className="text-sm text-neutral-500">
                    支持 PDF、DOC、DOCX、JPG、PNG 格式，文件大小不超过 10MB
                  </p>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleUpload}
                />

                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    已上传简历
                  </h3>
                  {resumeLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-16 w-16 text-neutral-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-4 text-lg text-neutral-500">
                        暂无上传的简历
                      </p>
                      <p className="mt-2 text-sm text-neutral-400">
                        点击上方按钮上传您的简历
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {resumes.map((resume) => (
                        <div
                          key={resume._id}
                          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                              <span className="font-bold text-red-600">
                                {resume.type}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-neutral-800">
                                  {resume.name}
                                </p>
                                {resume.isActive && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                    当前简历
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-neutral-500">
                                上传时间：{resume.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="rounded-lg px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
                              onClick={() => {
                                // 查看简历
                                window.open(
                                  `http://localhost:3000/uploads/${encodeURIComponent(resume.name)}`,
                                  "_blank",
                                );
                              }}
                            >
                              查看
                            </button>
                            {!resume.isActive && (
                              <button
                                type="button"
                                className="rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                                onClick={async () => {
                                  try {
                                    await resumeApi.setCurrentResume(
                                      resume._id,
                                    );
                                    // 重新获取简历列表
                                    const user = userApi.getCurrentUser();
                                    if (user) {
                                      const resumeData =
                                        await resumeApi.getStudentResumes();
                                      const formattedResumes: ResumeItem[] =
                                        resumeData.map((r) => ({
                                          _id: r._id,
                                          name:
                                            r.fileUrl.split("/").pop() ||
                                            "resume",
                                          uploadedAt: new Date(
                                            r.createdAt,
                                          ).toLocaleString("zh-CN"),
                                          type: r.fileType.toUpperCase() as
                                            | "PDF"
                                            | "DOC"
                                            | "DOCX"
                                            | "JPG"
                                            | "PNG",
                                          isActive: r.isActive,
                                        }));
                                      setResumes(formattedResumes);
                                    }
                                  } catch (error) {
                                    console.error("设置当前简历失败:", error);
                                    alert("设置当前简历失败，请重试");
                                  }
                                }}
                              >
                                设为当前
                              </button>
                            )}
                            <button
                              type="button"
                              className="rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                              onClick={async () => {
                                if (window.confirm("确定要删除这份简历吗？")) {
                                  try {
                                    await resumeApi.deleteResume(resume._id);
                                    // 重新获取简历列表
                                    const user = userApi.getCurrentUser();
                                    if (user) {
                                      const resumeData =
                                        await resumeApi.getStudentResumes();
                                      const formattedResumes: ResumeItem[] =
                                        resumeData.map((r) => ({
                                          _id: r._id,
                                          name:
                                            r.fileUrl.split("/").pop() ||
                                            "resume",
                                          uploadedAt: new Date(
                                            r.createdAt,
                                          ).toLocaleString("zh-CN"),
                                          type: r.fileType.toUpperCase() as
                                            | "PDF"
                                            | "DOC"
                                            | "DOCX"
                                            | "JPG"
                                            | "PNG",
                                          isActive: r.isActive,
                                        }));
                                      setResumes(formattedResumes);
                                    }
                                  } catch (error) {
                                    console.error("删除简历失败:", error);
                                    alert("删除简历失败，请重试");
                                  }
                                }
                              }}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "myInterviews" && (
              <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    我的面试
                  </h2>
                </div>
                {interviewLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-neutral-700">
                        团队面试邀请
                      </h3>
                      {interviewInvitations.length === 0 ? (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-16 w-16 text-neutral-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <p className="mt-4 text-lg text-neutral-500">
                            暂无面试邀请
                          </p>
                          <p className="mt-2 text-sm text-neutral-400">
                            当有面试邀请时，会显示在这里
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {interviewInvitations.map((invitation: any) => (
                            <div
                              key={invitation._id}
                              className="rounded-lg border border-neutral-200 p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-md font-semibold text-neutral-800">
                                    {invitation.type === "online"
                                      ? "线上面试"
                                      : "线下面试"}{" "}
                                    - 职位名称
                                  </h4>
                                  <p className="mt-1 text-sm text-neutral-600">
                                    邀请你参加
                                    {invitation.type === "online"
                                      ? "线上"
                                      : "线下"}
                                    面试
                                  </p>
                                  <div className="mt-3 space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                                        面试时间
                                      </label>
                                      <p className="text-sm text-neutral-700">
                                        {new Date(
                                          invitation.scheduledTime,
                                        ).toLocaleString("zh-CN")}
                                      </p>
                                    </div>
                                    {invitation.type === "online" && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-neutral-500">
                                          面试链接：
                                        </span>
                                        <a
                                          href={invitation.meetingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-primary-600 hover:underline"
                                        >
                                          {invitation.meetingUrl}
                                        </a>
                                      </div>
                                    )}
                                    {invitation.type === "offline" && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-neutral-500">
                                          面试地点：
                                        </span>
                                        <span className="text-sm text-neutral-700">
                                          {invitation.location}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                                    onClick={async () => {
                                      try {
                                        await interviewInvitationApi.confirmInterviewInvitation(
                                          invitation._id,
                                          { userFeedback: "confirmed" },
                                        );
                                        // 重新获取面试数据
                                        const user = userApi.getCurrentUser();
                                        if (user) {
                                          const interviewInvitationData =
                                            await interviewInvitationApi.getUserInterviewInvitations(
                                              user._id,
                                            );
                                          setInterviewInvitations(
                                            interviewInvitationData.data || [],
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "接受面试邀请失败:",
                                          error,
                                        );
                                        alert("接受面试邀请失败，请重试");
                                      }
                                    }}
                                  >
                                    接受
                                  </button>
                                  <button
                                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
                                    onClick={async () => {
                                      try {
                                        await interviewInvitationApi.confirmInterviewInvitation(
                                          invitation._id,
                                          { userFeedback: "declined" },
                                        );
                                        // 重新获取面试数据
                                        const user = userApi.getCurrentUser();
                                        if (user) {
                                          const interviewInvitationData =
                                            await interviewInvitationApi.getUserInterviewInvitations(
                                              user._id,
                                            );
                                          setInterviewInvitations(
                                            interviewInvitationData.data || [],
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "拒绝面试邀请失败:",
                                          error,
                                        );
                                        alert("拒绝面试邀请失败，请重试");
                                      }
                                    }}
                                  >
                                    拒绝
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-neutral-700">
                        AI预面试
                      </h3>
                      {aiPreInterviews.length === 0 ? (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-16 w-16 text-neutral-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          <p className="mt-4 text-lg text-neutral-500">
                            暂无AI预面试邀请
                          </p>
                          <p className="mt-2 text-sm text-neutral-400">
                            当有AI预面试邀请时，会显示在这里
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {aiPreInterviews.map((interview: any) => (
                            <div
                              key={interview._id}
                              className="rounded-lg border border-neutral-200 p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-md font-semibold text-neutral-800">
                                    AI预面试 - 职位名称
                                  </h4>
                                  <p className="mt-1 text-sm text-neutral-600">
                                    AI预面试邀请
                                  </p>
                                  <p className="mt-2 text-sm text-neutral-500">
                                    投递时间：
                                    {new Date(
                                      interview.createdAt,
                                    ).toLocaleString("zh-CN")}
                                  </p>
                                  {interview.score !== null && (
                                    <p className="mt-1 text-sm text-neutral-500">
                                      面试得分：{interview.score}
                                    </p>
                                  )}
                                </div>
                                {interview.status === "pending" && (
                                  <button
                                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                                    onClick={() =>
                                      navigate(`/ai-interview/${interview._id}`)
                                    }
                                  >
                                    开始面试
                                  </button>
                                )}
                                {interview.status === "completed" && (
                                  <span className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-600">
                                    已完成
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    收藏岗位
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600"
                    >
                      一键投递
                    </button>
                    <div className="relative">
                      <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-neutral-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                            {notificationCount > 99 ? "99+" : notificationCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : favoriteJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-16 w-16 text-neutral-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <p className="mt-4 text-lg text-neutral-500">
                      暂无收藏岗位
                    </p>
                    <p className="mt-2 text-sm text-neutral-400">
                      去招新大厅浏览职位吧
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favoriteJobs.map((job) => (
                      <div
                        key={job._id}
                        className="rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-800">
                              {job.title}
                            </h3>
                            <p className="text-neutral-600">{job.department}</p>
                          </div>
                          <span className="text-lg font-bold text-primary-600">
                            {job.interviewType === "online"
                              ? "线上面试"
                              : "线下面试"}
                          </span>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.requirements?.skills?.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500">
                          收藏时间：{job.savedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "interviews" && (
              <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    历史模拟面试
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600">
                      平均分 {averageScore}
                    </div>
                    <div className="relative">
                      <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-neutral-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                            {notificationCount > 99 ? "99+" : notificationCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {interviewHistory.map((record) => (
                    <div
                      key={record.title}
                      className="rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-neutral-800">
                            {record.title}
                          </h3>
                          <p className="text-neutral-600">{record.time}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-3xl font-bold text-primary-500">
                            {record.score}
                          </span>
                          <p className="text-sm text-neutral-500">综合评分</p>
                        </div>
                      </div>
                      <div className="mb-4 grid grid-cols-3 gap-4">
                        {record.details.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-lg bg-neutral-50 p-3 text-center"
                          >
                            <p className="text-lg font-semibold text-neutral-800">
                              {item.value}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {item.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="rounded-lg px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 更换手机号弹窗 */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-neutral-800">
              更换手机号
            </h3>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                新手机号
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(event) => setNewPhone(event.target.value)}
                placeholder="请输入新手机号"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                验证码
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  placeholder="请输入验证码"
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <button
                  type="button"
                  className={`rounded-lg px-3 py-3 text-sm transition-colors ${
                    countdown > 0
                      ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
                  onClick={sendVerificationCode}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}秒后重发` : "发送验证码"}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50"
                onClick={() => setShowPhoneModal(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                onClick={handleConfirmChangePhone}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

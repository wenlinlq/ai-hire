import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import positionApi from "../../api/positionApi";
import teamApi from "../../api/teamApi";
import userApi from "../../api/userApi";
import { deliveryApi } from "../../api/deliveryApi";
import favoriteApi from "../../api/favoriteApi";
import resumeApi from "../../api/resumeApi";

interface Job {
  _id: string;
  title: string;
  type: string;
  department: string;
  quota: number;
  salary: string;
  interviewType: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
    description: string;
  };
  responsibilities: string[];
  benefits: string[];
  status: string;
  deadline: string;
  viewCount: number;
  applyCount: number;
  createdBy: string;
  teamId: string;
  teamName?: string;
  createdAt: string;
  updatedAt: string;
}

function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [applying, setApplying] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const isLoggedIn = userApi.isLoggedIn();

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const response = await positionApi.getPosition(id || "");

        if (response) {
          const teams = await teamApi.getTeams();
          const team = teams.find((t) => t._id === response.teamId);

          setJob({
            ...response,
            teamName: team?.name || "未知团队",
          });

          // 检查用户是否已经投递了该职位
          const currentUser = userApi.getCurrentUser();
          if (currentUser) {
            try {
              // 获取用户的投递记录
              const deliveries = await deliveryApi.getUserDeliveries(
                currentUser._id,
              );
              const deliveredJobIds = deliveries.data.map(
                (delivery: any) => delivery.jobId,
              );
              // 检查当前职位是否在投递记录中
              setDelivered(deliveredJobIds.includes(response._id));

              // 检查是否收藏
              const favoriteIds = await favoriteApi.getUserFavorites(
                currentUser._id,
              );
              setIsFavorite(favoriteIds.includes(response._id));
            } catch (error) {
              console.error("获取用户状态失败:", error);
            }
          }
        } else {
          setJob(null);
        }
      } catch (error) {
        console.error("获取职位详情失败:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id]);

  const handleApply = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!job) return;

    try {
      setApplying(true);

      // 获取用户的当前简历ID
      const currentUser = userApi.getCurrentUser();
      const resume = await resumeApi.getCurrentResume();

      if (!resume) {
        alert("请先上传简历再投递");
        navigate("/resume");
        return;
      }

      const resumeId = resume._id;

      // 检查职位是否需要AI预面试
      const hasAiPreInterview = (job as any).aiPreInterview || false;

      // 创建投递记录
      await deliveryApi.createDelivery({
        userId: currentUser._id,
        jobId: job._id,
        resumeId,
        hasAiPreInterview,
      });

      alert("投递成功！");
      setJob({ ...job, applyCount: job.applyCount + 1 });
      setDelivered(true); // 更新投递状态
    } catch (error) {
      console.error("投递失败:", error);
      alert("投递失败，请稍后重试");
    } finally {
      setApplying(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            招聘中
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
            已关闭
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            暂停招聘
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
            未知状态
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500">加载中...</div>
      </div>
    );
  }

  if (!job) {
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
          <p className="mt-4 text-lg text-neutral-500">职位不存在</p>
          <button
            onClick={() => navigate("/hall")}
            className="mt-4 rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-600 transition-colors"
          >
            返回职位列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/hall")}
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
          返回职位列表
        </button>

        <div className="space-y-8">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-neutral-800">
                    {job.title}
                  </h1>
                  {getStatusBadge(job.status)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {job.teamName}
                  </span>
                  <span className="flex items-center gap-1">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
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
                    发布于 {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-3xl font-bold text-primary-600">
                  {job.salary}
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {job.viewCount} 浏览
                  </span>
                  <span className="flex items-center gap-1">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {job.applyCount} 已投递
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:items-end">
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
                <h2 className="mb-6 text-xl font-bold text-neutral-800">
                  职位描述
                </h2>
                <div className="prose max-w-none text-neutral-700 leading-relaxed whitespace-pre-line">
                  {job.requirements.description}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
                <h2 className="mb-6 text-xl font-bold text-neutral-800">
                  岗位职责
                </h2>
                <ul className="space-y-4">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500"
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
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
                <h2 className="mb-6 text-xl font-bold text-neutral-800">
                  任职要求
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-semibold text-neutral-800">
                      技能要求
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {job.requirements.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {job.benefits.length > 0 && (
                <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
                  <h2 className="mb-6 text-xl font-bold text-neutral-800">
                    福利待遇
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5 text-primary-500"
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
                        <span className="text-neutral-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
                <h2 className="mb-6 text-lg font-bold text-neutral-800">
                  职位信息
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-neutral-500">招聘人数</div>
                    <div className="font-semibold text-neutral-800">
                      {job.quota} 人
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">面试类型</div>
                    <div className="font-semibold text-neutral-800">
                      {job.interviewType === "online" ? "线上面试" : "线下面试"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">截止日期</div>
                    <div className="font-semibold text-neutral-800">
                      {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">所属部门</div>
                    <div className="font-semibold text-neutral-800">
                      {job.department}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white shadow-md p-8">
                <h2 className="mb-6 text-lg font-bold text-neutral-800">
                  快速操作
                </h2>
                <div className="space-y-4">
                  {delivered ? (
                    <span className="w-full rounded-lg px-6 py-4 font-medium text-neutral-600 bg-neutral-100 text-center">
                      等待结果
                    </span>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={
                        applying ||
                        (job.status !== "active" && job.status !== "open")
                      }
                      className={`w-full rounded-lg px-6 py-4 font-medium text-white transition-colors ${
                        applying ||
                        (job.status !== "active" && job.status !== "open")
                          ? "bg-neutral-400 cursor-not-allowed"
                          : "bg-primary-500 hover:bg-primary-600"
                      }`}
                    >
                      {applying
                        ? "投递中..."
                        : job.status === "active" || job.status === "open"
                          ? "投递简历"
                          : "已关闭"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;

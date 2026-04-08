import { useState, useEffect } from "react";
import { LogoMark } from "../../components/site";
import positionApi from "../../api/positionApi";
import applicationApi from "../../api/applicationApi";
import userApi from "../../api/userApi";

type AdminTab = "dashboard" | "jobs" | "candidates" | "interviews";
type AdminModal = "job" | "candidate" | "interview" | null;

const dashboardStats = [
  {
    label: "开放职位",
    value: "24",
    delta: "+12%",
    iconClass: "bg-primary-100 text-primary-600",
  },
  {
    label: "候选人",
    value: "156",
    delta: "+8%",
    iconClass: "bg-primary-100 text-primary-600",
  },
  {
    label: "面试中",
    value: "32",
    delta: "-3%",
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    label: "已录用",
    value: "8",
    delta: "+25%",
    iconClass: "bg-green-100 text-green-600",
  },
] as const;

const activityFeed = [
  {
    title: "新职位发布",
    subtitle: "高级前端工程师 - 阿里巴巴",
    time: "2小时前",
  },
  { title: "候选人通过面试", subtitle: "李四 - 产品经理", time: "5小时前" },
  { title: "面试安排", subtitle: "王五 - UI设计师", time: "1天前" },
] as const;

// 职位数据类型
interface Job {
  _id: string;
  title: string;
  type: string;
  department: string;
  quota: number;
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
  createdAt: string;
  updatedAt: string;
  teamId: string;
}

// 职位表单状态类型
interface JobFormState {
  title: string;
  type: string;
  department: string;
  quota: number;
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
  teamId: string;
}

const interviewPrograms = [
  { title: "技术面试任务", count: 28, note: "本周计划完成 12 场" },
  { title: "评分分布", count: 86, note: "平均分稳定在 80 以上" },
] as const;

function Admin() {
  // 从localStorage读取标签页状态，如果没有则默认为dashboard
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    return (savedTab as AdminTab) || "dashboard";
  });

  // 切换标签页并保存到localStorage
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    localStorage.setItem("adminActiveTab", tab);
  };
  const [modal, setModal] = useState<AdminModal>(null);

  // 打开模态框时的处理
  const openModal = (modalType: AdminModal) => {
    setModal(modalType);
    // 当打开面试弹框时，确保加载候选人数据
    if (modalType === "interview" && candidates.length === 0) {
      fetchCandidates();
    }
  };

  // 职位列表状态
  const [jobs, setJobs] = useState<Job[]>([]);
  // 加载状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 错误状态
  const [error, setError] = useState<string | null>(null);
  // 职位表单状态
  const [jobForm, setJobForm] = useState<JobFormState>({
    title: "",
    type: "full-time",
    department: "",
    quota: 1,
    requirements: {
      skills: [],
      experience: "",
      education: "",
      description: "",
    },
    responsibilities: [],
    benefits: [],
    status: "open",
    deadline: "",
    teamId: "",
  });
  // 当前编辑的职位ID
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // 候选人列表状态
  const [candidates, setCandidates] = useState<any[]>([]);
  // 候选人加载状态
  const [isLoadingCandidates, setIsLoadingCandidates] =
    useState<boolean>(false);
  // 候选人错误状态
  const [errorCandidates, setErrorCandidates] = useState<string | null>(null);

  // 候选人表单状态
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    phone: "",
    email: "",
    grade: "",
    major: "",
    positionId: "",
    teamId: "",
    resume: null,
  });

  // 查看候选人弹窗状态
  const [viewModal, setViewModal] = useState(false);
  // 当前查看的候选人信息
  const [currentCandidate, setCurrentCandidate] = useState<any>(null);

  // 当前用户信息
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 获取当前用户信息
  useEffect(() => {
    const user = userApi.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // 获取职位列表
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let jobList;
      // 如果当前用户有团队ID，则获取该团队的职位；否则获取所有职位
      console.log("当前用户信息:", currentUser);
      console.log("当前用户team字段:", currentUser?.team);
      console.log("team字段类型:", typeof currentUser?.team);

      if (currentUser?.team) {
        jobList = await positionApi.getPositionsByTeam(currentUser.team);
        console.log("根据团队获取的职位列表:", jobList);
      } else {
        jobList = await positionApi.getPositions();
        console.log("获取的所有职位列表:", jobList);
      }
      // 确保jobList是一个数组
      setJobs(Array.isArray(jobList) ? jobList : []);
    } catch (err: any) {
      console.error("获取职位列表错误:", err);
      setError(err.message || "获取职位列表失败");
      // 发生错误时，确保jobs是一个空数组
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取候选人列表
  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    setErrorCandidates(null);
    try {
      let candidateList;
      // 如果当前用户有团队ID，则获取该团队的候选人；否则获取所有候选人
      if (currentUser?.team) {
        candidateList = await applicationApi.getApplicationsByTeam(
          currentUser.team,
        );
      } else {
        candidateList = await applicationApi.getApplications();
      }
      // 确保candidateList是一个数组
      setCandidates(Array.isArray(candidateList) ? candidateList : []);
    } catch (err: any) {
      setErrorCandidates(err.message || "获取候选人列表失败");
      // 发生错误时，确保candidates是一个空数组
      setCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    // 无论当前标签页是什么，都获取职位列表，因为导入候选人弹窗需要使用
    if (currentUser) {
      fetchJobs();

      if (activeTab === "candidates") {
        fetchCandidates();
      }
    }
  }, [activeTab, currentUser]);

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-700">
      <aside className="sticky top-0 h-screen w-64 border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center space-x-2">
            <LogoMark className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-neutral-800">AI招聘</span>
          </div>
        </div>

        <nav className="py-4">
          <div className="mb-2 px-4 text-xs font-semibold uppercase text-neutral-500">
            管理后台
          </div>
          <ul className="space-y-1">
            {[
              ["dashboard", "团队仪表盘"],
              ["jobs", "职位管理"],
              ["candidates", "候选人管理"],
              ["interviews", "AI面试中心"],
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  type="button"
                  className={`w-full border-r-4 px-4 py-3 text-left transition-colors ${
                    activeTab === key
                      ? "border-primary-500 bg-neutral-50 text-primary-500"
                      : "border-transparent hover:bg-neutral-50"
                  }`}
                  onClick={() => handleTabChange(key as AdminTab)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <h1 className="text-xl font-bold text-neutral-800">管理后台</h1>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
              <span className="font-semibold text-primary-600">
                {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-700">
              {currentUser?.username || "用户"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <section>
              <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="mb-1 text-sm text-neutral-500">
                          {item.label}
                        </p>
                        <h3 className="text-2xl font-bold text-neutral-800">
                          {item.value}
                        </h3>
                      </div>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconClass}`}
                      >
                        ●
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span
                        className={`text-sm ${item.delta.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.delta}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">
                        较上月
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {["招聘漏斗", "月度招聘趋势"].map((chart) => (
                  <div
                    key={chart}
                    className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                      {chart}
                    </h3>
                    <div className="flex h-80 items-end gap-3">
                      {[35, 62, 48, 70, 54, 83].map((value, index) => (
                        <div
                          key={`${chart}-${index}`}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className="w-full rounded-t-md bg-primary-400"
                            style={{ height: `${value}%` }}
                          />
                          <span className="mt-2 text-xs text-neutral-500">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                  最近活动
                </h3>
                <div className="space-y-4">
                  {activityFeed.map((item) => (
                    <div
                      key={item.title + item.time}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        ●
                      </div>
                      <div>
                        <p className="text-neutral-800">{item.title}</p>
                        <p className="text-sm text-neutral-500">
                          {item.subtitle}
                        </p>
                        <p className="text-xs text-neutral-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "jobs" && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  职位管理
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                  onClick={() => {
                    // 重置表单
                    setCurrentJobId(null);
                    setJobForm({
                      title: "",
                      type: "full-time",
                      department: "",
                      quota: 1,
                      requirements: {
                        skills: [],
                        experience: "",
                        education: "",
                        description: "",
                      },
                      responsibilities: [],
                      benefits: [],
                      status: "open",
                      deadline: "",
                      teamId: currentUser?.team || "",
                    });
                    openModal("job");
                  }}
                >
                  发布新职位
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="搜索职位"
                      className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2">
                      <option>全部状态</option>
                      <option>招聘中</option>
                      <option>已关闭</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {[
                          "职位名称",
                          "部门",
                          "招聘人数",
                          "截止时间",
                          "状态",
                          "操作",
                        ].map((item) => (
                          <th key={item} className="px-6 py-3">
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            加载中...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : jobs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            暂无职位
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job) => (
                          <tr key={job._id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-neutral-900">
                                {job.title}
                              </div>
                              <div className="text-sm text-neutral-500">
                                {job.type}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {job.department}
                            </td>
                            <td className="px-6 py-4 text-sm">{job.quota}</td>
                            <td className="px-6 py-4 text-sm">
                              {new Date(job.deadline).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${job.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {job.status === "open" ? "招聘中" : "已关闭"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                type="button"
                                className="mr-3 text-primary-600 hover:text-primary-900"
                                onClick={() => {
                                  // 填充表单
                                  setCurrentJobId(job._id);
                                  setJobForm({
                                    title: job.title,
                                    type: job.type,
                                    department: job.department,
                                    quota: job.quota,
                                    requirements: job.requirements,
                                    responsibilities: job.responsibilities,
                                    benefits: job.benefits,
                                    status: job.status,
                                    deadline: new Date(job.deadline)
                                      .toISOString()
                                      .split("T")[0],
                                    teamId: job.teamId,
                                  });
                                  setModal("job");
                                }}
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                className={
                                  job.status === "open"
                                    ? "text-red-600 hover:text-red-900"
                                    : "text-green-600 hover:text-green-900"
                                }
                                onClick={async () => {
                                  try {
                                    if (job.status === "open") {
                                      // 关闭职位
                                      await positionApi.updatePosition(
                                        job._id,
                                        { status: "closed" },
                                      );
                                      window.message.success("职位已关闭");
                                    } else {
                                      // 重新开放职位
                                      await positionApi.updatePosition(
                                        job._id,
                                        { status: "open" },
                                      );
                                      window.message.success("职位已重新开放");
                                    }
                                    // 重新获取职位列表
                                    fetchJobs();
                                  } catch (err: any) {
                                    window.message.error(
                                      err.message || "操作失败",
                                    );
                                  }
                                }}
                              >
                                {job.status === "open" ? "关闭" : "重新开放"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "candidates" && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  候选人管理
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                  onClick={() => {
                    // 重置表单，设置团队ID为当前用户的团队ID
                    setCandidateForm({
                      name: "",
                      phone: "",
                      email: "",
                      grade: "",
                      major: "",
                      positionId: "",
                      teamId: currentUser?.team || "",
                      resume: null,
                    });
                    openModal("candidate");
                  }}
                >
                  导入候选人
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="搜索候选人"
                      className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2">
                      {[
                        "全部状态",
                        "简历筛选",
                        "初试",
                        "复试",
                        "已录用",
                        "已拒绝",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {[
                          "候选人",
                          "年级",
                          "专业",
                          "应聘职位",
                          "投递时间",
                          "状态",
                          "操作",
                        ].map((item) => (
                          <th key={item} className="px-6 py-3">
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {isLoadingCandidates ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            加载中...
                          </td>
                        </tr>
                      ) : errorCandidates ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-red-500"
                          >
                            {errorCandidates}
                          </td>
                        </tr>
                      ) : candidates.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            暂无候选人
                          </td>
                        </tr>
                      ) : (
                        candidates.map((candidate) => (
                          <tr key={candidate._id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-neutral-900">
                                {candidate.name || candidate.studentId}{" "}
                              </div>
                              <div className="text-sm text-neutral-500">
                                {candidate.email || candidate.studentId}{" "}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {candidate.grade || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {candidate.major || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {candidate.positionName || candidate.positionId}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {new Date(
                                candidate.appliedAt,
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${candidate.status === "pending" ? "bg-yellow-100 text-yellow-800" : candidate.status === "screening" ? "bg-blue-100 text-blue-800" : candidate.status === "interview" ? "bg-purple-100 text-purple-800" : candidate.status === "offer" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {candidate.status === "pending"
                                  ? "待处理"
                                  : candidate.status === "screening"
                                    ? "简历筛选"
                                    : candidate.status === "interview"
                                      ? "面试中"
                                      : candidate.status === "offer"
                                        ? "已录用"
                                        : "已拒绝"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                type="button"
                                className="mr-3 text-primary-600 hover:text-primary-900"
                                onClick={() => {
                                  setCurrentCandidate(candidate);
                                  setViewModal(true);
                                }}
                              >
                                查看
                              </button>
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-900"
                              >
                                安排面试
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "interviews" && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  AI面试中心
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                  onClick={() => openModal("interview")}
                >
                  创建面试
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {interviewPrograms.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                      {card.title}
                    </h3>
                    <div className="mb-3 text-4xl font-bold text-primary-600">
                      {card.count}
                    </div>
                    <p className="text-sm text-neutral-500">{card.note}</p>
                    <div className="mt-6 flex h-48 items-end gap-3">
                      {[45, 72, 60, 80, 68].map((value, index) => (
                        <div
                          key={`${card.title}-${index}`}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className="w-full rounded-t-md bg-primary-400"
                            style={{ height: `${value}%` }}
                          />
                          <span className="mt-2 text-xs text-neutral-500">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">
                {modal === "job"
                  ? "发布新职位"
                  : modal === "candidate"
                    ? "导入候选人"
                    : "创建面试"}
              </h3>
              <button
                type="button"
                className="text-neutral-500 hover:text-neutral-800"
                onClick={() => setModal(null)}
              >
                关闭
              </button>
            </div>

            {modal === "job" && (
              <div className="space-y-4">
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="职位名称"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                />
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="部门"
                  value={jobForm.department}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, department: e.target.value })
                  }
                />
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={jobForm.type}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, type: e.target.value })
                  }
                >
                  <option value="full-time">全职</option>
                  <option value="part-time">兼职</option>
                  <option value="intern">实习</option>
                </select>
                <input
                  type="number"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="招聘人数"
                  value={jobForm.quota}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      quota: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <textarea
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  rows={3}
                  placeholder="职位描述"
                  value={jobForm.requirements.description}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      requirements: {
                        ...jobForm.requirements,
                        description: e.target.value,
                      },
                    })
                  }
                />
                <textarea
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  rows={3}
                  placeholder="任职要求"
                  value={jobForm.requirements.experience}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      requirements: {
                        ...jobForm.requirements,
                        experience: e.target.value,
                      },
                    })
                  }
                />
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={jobForm.deadline}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, deadline: e.target.value })
                  }
                />
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={jobForm.status}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, status: e.target.value })
                  }
                >
                  <option value="open">招聘中</option>
                  <option value="closed">已关闭</option>
                </select>
              </div>
            )}

            {modal === "candidate" && (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="姓名"
                  value={candidateForm.name}
                  onChange={(e) =>
                    setCandidateForm({ ...candidateForm, name: e.target.value })
                  }
                />
                <input
                  type="tel"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="手机号"
                  value={candidateForm.phone}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      phone: e.target.value,
                    })
                  }
                />
                <input
                  type="email"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="邮箱"
                  value={candidateForm.email}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      email: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="年级"
                  value={candidateForm.grade}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      grade: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="专业"
                  value={candidateForm.major}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      major: e.target.value,
                    })
                  }
                />
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={candidateForm.positionId}
                  onChange={(e) => {
                    const selectedJobId = e.target.value;
                    // 查找所选职位的信息
                    const selectedJob = jobs.find(
                      (job) => job._id === selectedJobId,
                    );
                    setCandidateForm({
                      ...candidateForm,
                      positionId: selectedJobId,
                      // 自动设置teamId为所选职位的teamId
                      teamId: selectedJob?.teamId || currentUser?.team || "",
                    });
                  }}
                >
                  <option value="">选择导入岗位</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <div className="w-full rounded-lg border border-neutral-300 px-4 py-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    上传简历
                  </label>
                  <input
                    type="file"
                    className="w-full"
                    onChange={(e) => {
                      console.log("选择的文件:", e.target.files[0]);
                      setCandidateForm({
                        ...candidateForm,
                        resume: e.target.files[0],
                      });
                    }}
                  />
                </div>
              </div>
            )}

            {modal === "interview" && (
              <div className="space-y-4">
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3">
                  <option>技术面试</option>
                  <option>产品面试</option>
                  <option>综合面试</option>
                </select>
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3">
                  <option>选择候选人</option>
                  {isLoadingCandidates ? (
                    <option>加载中...</option>
                  ) : (
                    candidates.map((candidate) => (
                      <option key={candidate._id} value={candidate._id}>
                        {candidate.name || candidate.studentId}
                      </option>
                    ))
                  )}
                </select>
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3">
                  <option>选择面试官</option>
                  <option>王面试官</option>
                </select>
                <textarea
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  rows={4}
                  placeholder="备注信息"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setModal(null);
                }}
                className="rounded-lg border border-neutral-300 px-6 py-2.5 font-medium text-neutral-700 hover:bg-neutral-100"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  try {
                    if (modal === "candidate") {
                      // 导入候选人
                      const formData = new FormData();
                      formData.append("name", candidateForm.name);
                      formData.append("phone", candidateForm.phone);
                      formData.append("email", candidateForm.email);
                      formData.append("grade", candidateForm.grade);
                      formData.append("major", candidateForm.major);
                      formData.append("positionId", candidateForm.positionId);
                      formData.append("teamId", candidateForm.teamId);
                      if (candidateForm.resume) {
                        formData.append("resume", candidateForm.resume);
                      }

                      console.log("发送的请求数据:", formData);
                      await applicationApi.importCandidate(formData);
                      window.message.success("候选人导入成功");
                      // 重新获取候选人列表
                      fetchCandidates();
                      // 重置表单
                      setCandidateForm({
                        name: "",
                        phone: "",
                        email: "",
                        grade: "",
                        major: "",
                        positionId: "",
                        teamId: "",
                        resume: null,
                      });
                    } else {
                      // 获取用户信息
                      const userStr = localStorage.getItem("user");
                      const user = userStr ? JSON.parse(userStr) : null;
                      // 准备表单数据
                      const formData = {
                        ...jobForm,
                        // 添加创建人信息
                        createdBy: user?._id || "660a0b6c4f1a2b3c4d5e6f70", // 使用有效的默认ObjectId
                        // 确保teamId有值且格式正确
                        teamId: currentUser?.team || "", // 使用当前用户的team，不使用硬编码的默认值
                      };
                      if (currentJobId) {
                        // 编辑职位
                        await positionApi.updatePosition(
                          currentJobId,
                          formData,
                        );
                        window.message.success("职位更新成功");
                      } else {
                        // 创建职位
                        await positionApi.createPosition(formData);
                        window.message.success("职位创建成功");
                      }
                      // 重新获取职位列表
                      fetchJobs();
                    }
                    // 关闭模态框
                    setModal(null);
                  } catch (err: any) {
                    // 解析错误信息
                    let errorMessage = "操作失败";
                    if (err.response && err.response.data) {
                      errorMessage =
                        err.response.data.message ||
                        err.response.data.error ||
                        errorMessage;
                    } else if (err.message) {
                      errorMessage = err.message;
                    }
                    window.message.error(errorMessage);
                  }
                }}
                className="rounded-lg bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看候选人弹窗 */}
      {viewModal && currentCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                候选人详情
              </h3>
              <button
                type="button"
                className="text-neutral-500 hover:text-neutral-900"
                onClick={() => setViewModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  姓名
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.name || currentCandidate.studentId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  手机号
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.phone || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  邮箱
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.email || currentCandidate.studentId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  年级
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.grade || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  专业
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.major || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  应聘职位
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.positionName || currentCandidate.positionId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  状态
                </label>
                <div className="text-sm">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${currentCandidate.status === "pending" ? "bg-yellow-100 text-yellow-800" : currentCandidate.status === "screening" ? "bg-blue-100 text-blue-800" : currentCandidate.status === "interview" ? "bg-purple-100 text-purple-800" : currentCandidate.status === "offer" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {currentCandidate.status === "pending"
                      ? "待处理"
                      : currentCandidate.status === "screening"
                        ? "简历筛选"
                        : currentCandidate.status === "interview"
                          ? "面试中"
                          : currentCandidate.status === "offer"
                            ? "已录用"
                            : "已拒绝"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  投递时间
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.appliedAt
                    ? new Date(currentCandidate.appliedAt).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  简历文件
                </label>
                <div className="text-sm text-neutral-900">
                  {currentCandidate.resumeId ? (
                    <a
                      href={`http://localhost:3000/uploads/${currentCandidate.resumeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      查看简历
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                onClick={() => setViewModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;

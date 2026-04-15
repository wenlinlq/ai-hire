import { useState, useEffect } from "react";
import { LogoMark } from "../../components/site";
import positionApi from "../../api/positionApi";
import applicationApi from "../../api/applicationApi";
import userApi from "../../api/userApi";
import * as questionBankApi from "../../api/questionBankApi";

type AdminTab =
  | "dashboard"
  | "jobs"
  | "candidates"
  | "interviews"
  | "questions";
type AdminModal = "job" | "candidate" | "interview" | "questionBank" | null;

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
  aiQuestionBankId?: string;
  aiQuestionBankName?: string;
  aiPreInterview?: boolean;
  aiPreInterviewScore?: number;
}

// 职位表单状态类型
interface JobFormState {
  title: string;
  type: string;
  department: string;
  quota: number;
  salary: string;
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
  interviewType: string;
  aiQuestionBankId: string;
  aiPreInterview: boolean;
  aiPreInterviewScore: number;
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
    salary: "",
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
    interviewType: "online",
    aiQuestionBankId: "",
    aiPreInterview: false,
    aiPreInterviewScore: 60,
  });
  // 当前编辑的职位ID
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // 题目类型
  interface Question {
    id: string;
    content: string;
  }

  // 题库表单状态
  interface QuestionBankFormState {
    title: string;
    description: string;
    category: string;
    questionCount: number;
    createdAt: string;
    questions: Question[];
  }

  // 当前编辑的题库ID
  const [currentQuestionBankId, setCurrentQuestionBankId] = useState<
    string | null
  >(null);
  // 题库表单状态
  const [questionBankForm, setQuestionBankForm] =
    useState<QuestionBankFormState>({
      title: "",
      description: "",
      category: "",
      questionCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      questions: [],
    });

  // 题目表单状态
  const [questionForm, setQuestionForm] = useState({
    content: "",
  });

  // 面试题库列表状态
  const [questionBanks, setQuestionBanks] = useState<
    questionBankApi.QuestionBank[]
  >([]);
  // 面试题库加载状态
  const [isLoadingQuestionBanks, setIsLoadingQuestionBanks] =
    useState<boolean>(false);
  // 面试题库错误状态
  const [errorQuestionBanks, setErrorQuestionBanks] = useState<string | null>(
    null,
  );

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

  // 获取面试题库列表
  const fetchQuestionBanks = async () => {
    setIsLoadingQuestionBanks(true);
    setErrorQuestionBanks(null);
    try {
      const response = await questionBankApi.getAllQuestionBanks();
      let questionBanks = response.data || [];
      // 根据用户的teamId过滤题库
      if (currentUser?.team) {
        questionBanks = questionBanks.filter(
          (bank) => bank.teamId === currentUser.team,
        );
      }
      setQuestionBanks(questionBanks);
    } catch (err: any) {
      console.error("获取面试题库列表错误:", err);
      setErrorQuestionBanks(err.message || "获取面试题库列表失败");
    } finally {
      setIsLoadingQuestionBanks(false);
    }
  };

  // 当用户信息变化时，获取面试题库列表
  useEffect(() => {
    if (currentUser) {
      fetchQuestionBanks();
    }
  }, [currentUser]);

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
      if (Array.isArray(jobList)) {
        // 为每个职位添加AI试题名称
        const jobsWithQuestionBankNames = jobList.map((job) => {
          if (job.aiQuestionBankId) {
            const questionBank = questionBanks.find(
              (bank) => bank._id === job.aiQuestionBankId,
            );
            return {
              ...job,
              aiQuestionBankName: questionBank?.title || "已设置",
            };
          }
          return job;
        });
        setJobs(jobsWithQuestionBankNames);
      } else {
        setJobs([]);
      }
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

  // 当面试题库列表更新时，重新获取职位列表以更新AI试题名称
  useEffect(() => {
    if (currentUser && activeTab === "jobs") {
      fetchJobs();
    }
  }, [questionBanks, currentUser, activeTab]);

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
              ["questions", "面试题库"],
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
                      salary: "",
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
                      interviewType: "online",
                      aiQuestionBankId: "",
                      aiPreInterview: false,
                      aiPreInterviewScore: 60,
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
                          "AI试题",
                          "AI预面试",
                          "AI预面试最低分",
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
                            colSpan={9}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            加载中...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-6 py-8 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : jobs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
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
                              {job.aiQuestionBankName ||
                                (job.aiQuestionBankId ? "已设置" : "未设置")}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${job.aiPreInterview ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {job.aiPreInterview ? "是" : "否"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {job.aiPreInterview
                                ? job.aiPreInterviewScore || 60
                                : "-"}
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
                                    salary: job.salary || "",
                                    requirements: {
                                      ...job.requirements,
                                      skills: Array.isArray(
                                        job.requirements?.skills,
                                      )
                                        ? job.requirements.skills
                                        : [],
                                    },
                                    responsibilities:
                                      job.responsibilities || [],
                                    benefits: job.benefits || [],
                                    status: job.status,
                                    deadline: new Date(job.deadline)
                                      .toISOString()
                                      .split("T")[0],
                                    teamId: job.teamId,
                                    interviewType:
                                      job.interviewType || "online",
                                    aiQuestionBankId:
                                      job.aiQuestionBankId || "",
                                    aiPreInterview: job.aiPreInterview || false,
                                    aiPreInterviewScore:
                                      job.aiPreInterviewScore || 60,
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
                            colSpan={8}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            加载中...
                          </td>
                        </tr>
                      ) : errorCandidates ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-red-500"
                          >
                            {errorCandidates}
                          </td>
                        </tr>
                      ) : candidates.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
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

          {activeTab === "questions" && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  面试题库
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                  onClick={() => {
                    // 重置表单
                    setCurrentQuestionBankId(null);
                    setQuestionBankForm({
                      title: "",
                      description: "",
                      category: "",
                      questionCount: 0,
                      createdAt: new Date().toISOString().split("T")[0],
                      questions: [],
                    });
                    openModal("questionBank");
                  }}
                >
                  添加题库
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="搜索题库"
                      className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2">
                      <option>全部分类</option>
                      <option>技术类</option>
                      <option>行为类</option>
                      <option>专业知识</option>
                      <option>项目经验</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {[
                          "题库名称",
                          "描述",
                          "分类",
                          "题目数量",
                          "创建时间",
                          "操作",
                        ].map((item) => (
                          <th key={item} className="px-6 py-3">
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {isLoadingQuestionBanks ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-neutral-500"
                          >
                            加载中...
                          </td>
                        </tr>
                      ) : errorQuestionBanks ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-red-500"
                          >
                            {errorQuestionBanks}
                          </td>
                        </tr>
                      ) : questionBanks.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-neutral-500"
                          >
                            暂无面试题库
                          </td>
                        </tr>
                      ) : (
                        questionBanks.map((bank) => (
                          <tr key={bank._id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-neutral-900">
                                {bank.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-500">
                              {bank.type || "无类型"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                {bank.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {bank.questions.length}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {
                                new Date(bank.createdAt)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                type="button"
                                className="mr-3 text-primary-600 hover:text-primary-900"
                                onClick={() => {
                                  // 填充表单
                                  setCurrentQuestionBankId(bank._id);
                                  setQuestionBankForm({
                                    title: bank.title,
                                    description: bank.description || "",
                                    category: bank.category,
                                    questionCount: bank.questions.length,
                                    createdAt: new Date(bank.createdAt)
                                      .toISOString()
                                      .split("T")[0],
                                    questions: bank.questions.map(
                                      (q, index) => ({
                                        id: `q-${index}`,
                                        content: q,
                                      }),
                                    ),
                                  });
                                  openModal("questionBank");
                                }}
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                onClick={async () => {
                                  if (
                                    window.confirm("确定要删除这个题库吗？")
                                  ) {
                                    try {
                                      await questionBankApi.deleteQuestionBank(
                                        bank._id,
                                      );
                                      window.message.success("题库删除成功");
                                      fetchQuestionBanks();
                                    } catch (err: any) {
                                      console.error("删除题库错误:", err);
                                      window.message.error(
                                        err.message || "删除题库失败",
                                      );
                                    }
                                  }
                                }}
                              >
                                删除
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
                    : modal === "interview"
                      ? "创建面试"
                      : "添加题库"}
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
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
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
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="薪资（如：10k-20k）"
                  value={jobForm.salary}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salary: e.target.value })
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
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="技能标签（多个标签用逗号分隔）"
                  value={jobForm.requirements.skills.join(",")}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      requirements: {
                        ...jobForm.requirements,
                        skills: e.target.value
                          .split(/[,，]/)
                          .map((s) => s.trim())
                          .filter((s) => s),
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
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={jobForm.interviewType}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, interviewType: e.target.value })
                  }
                >
                  <option value="online">线上面试</option>
                  <option value="offline">线下面试</option>
                </select>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={jobForm.aiQuestionBankId}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, aiQuestionBankId: e.target.value })
                  }
                >
                  <option value="">选择AI试题</option>
                  {questionBanks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.title}
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aiPreInterview"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={jobForm.aiPreInterview}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        aiPreInterview: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="aiPreInterview"
                    className="text-sm font-medium text-neutral-700"
                  >
                    启用AI预面试
                  </label>
                </div>
                {jobForm.aiPreInterview && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      AI预面试最低分
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      value={jobForm.aiPreInterviewScore}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          aiPreInterviewScore: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {modal === "candidate" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
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
                    setCandidateForm({
                      ...candidateForm,
                      positionId: e.target.value,
                    });
                  }}
                >
                  <option value="">选择职位</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {modal === "questionBank" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
                <input
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="题库名称"
                  value={questionBankForm.title}
                  onChange={(e) =>
                    setQuestionBankForm({
                      ...questionBankForm,
                      title: e.target.value,
                    })
                  }
                />
                <textarea
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  rows={3}
                  placeholder="题库描述"
                  value={questionBankForm.description}
                  onChange={(e) =>
                    setQuestionBankForm({
                      ...questionBankForm,
                      description: e.target.value,
                    })
                  }
                />
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={questionBankForm.category}
                  onChange={(e) =>
                    setQuestionBankForm({
                      ...questionBankForm,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="">选择分类</option>
                  <option value="技术类">技术类</option>
                  <option value="行为类">行为类</option>
                  <option value="专业知识">专业知识</option>
                  <option value="项目经验">项目经验</option>
                </select>

                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={questionBankForm.createdAt}
                  onChange={(e) =>
                    setQuestionBankForm({
                      ...questionBankForm,
                      createdAt: e.target.value,
                    })
                  }
                />

                {/* 面试题目管理 */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-neutral-800">
                      面试题目
                    </h4>
                  </div>
                  <div className="mb-4 space-y-2">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="输入题目内容"
                      value={questionForm.content}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          content: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="w-full rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                      onClick={() => {
                        if (questionForm.content.trim()) {
                          // 添加题目
                          const newQuestion = {
                            id: `q-${Date.now()}`,
                            content: questionForm.content,
                          };
                          setQuestionBankForm({
                            ...questionBankForm,
                            questions: [
                              ...questionBankForm.questions,
                              newQuestion,
                            ],
                          });
                          // 重置题目表单
                          setQuestionForm({
                            content: "",
                          });
                        }
                      }}
                    >
                      添加题目
                    </button>
                  </div>
                  <div className="rounded-lg border border-neutral-200">
                    {questionBankForm.questions.length === 0 ? (
                      <div className="p-4 text-center text-neutral-500">
                        暂无题目，输入题目内容后点击添加题目按钮
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-200">
                        {questionBankForm.questions.map((question, index) => (
                          <div key={question.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {index + 1}. {question.content}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => {
                                    setQuestionBankForm({
                                      ...questionBankForm,
                                      questions:
                                        questionBankForm.questions.filter(
                                          (q) => q.id !== question.id,
                                        ),
                                    });
                                  }}
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modal === "interview" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
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
                    } else if (modal === "questionBank") {
                      // 保存题库
                      // 获取用户信息
                      const userStr = localStorage.getItem("user");
                      const user = userStr ? JSON.parse(userStr) : null;
                      // 准备表单数据
                      const formData = {
                        title: questionBankForm.title,
                        type: "essay", // 默认为简答题
                        category: questionBankForm.category,
                        teamId: currentUser?.team || user?._id || "", // 使用当前用户的team或用户ID
                        questions: questionBankForm.questions.map(
                          (q) => q.content,
                        ), // 转换为字符串数组
                      };
                      if (currentQuestionBankId) {
                        // 编辑题库
                        await questionBankApi.updateQuestionBank(
                          currentQuestionBankId,
                          formData,
                        );
                        window.message.success("题库更新成功");
                      } else {
                        // 创建题库
                        await questionBankApi.createQuestionBank(formData);
                        window.message.success("题库创建成功");
                      }
                      // 重新获取面试题库列表
                      fetchQuestionBanks();
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
                  {currentCandidate.resumeFileUrl ? (
                    <a
                      href={`http://localhost:3000${currentCandidate.resumeFileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      查看简历
                    </a>
                  ) : currentCandidate.resumeId ? (
                    <a
                      href={`http://localhost:3000/uploads/${encodeURIComponent(currentCandidate.resumeId)}`}
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

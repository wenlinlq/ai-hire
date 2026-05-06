import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import positionApi from "../../api/positionApi";
import applicationApi from "../../api/applicationApi";
import userApi from "../../api/userApi";
import * as questionBankApi from "../../api/questionBankApi";
import {
  notificationApi,
  notificationTemplateApi,
} from "../../api/notificationApi";
import { interviewInvitationApi } from "../../api/interviewInvitationApi";

type AdminTab =
  | "dashboard"
  | "jobs"
  | "candidates"
  | "questions"
  | "notifications";
type AdminModal =
  | "job"
  | "candidate"
  | "interview"
  | "questionBank"
  | "notification"
  | null;

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
  salary?: string;
  interviewType?: string;
  aiResumeFilter?: boolean;
  aiResumeFilterScore?: number;
  aiResumeFilterSkills?: string[];
}

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
  aiResumeFilter: boolean;
  aiResumeFilterScore: number;
  aiResumeFilterSkills: string[];
}

interface Question {
  id: string;
  content: string;
}

interface QuestionBankFormState {
  title: string;
  description: string;
  category: string;
  questionCount: number;
  createdAt: string;
  questions: Question[];
}

interface TeamContextType {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  handleTabChange: (tab: AdminTab) => void;
  modal: AdminModal;
  setModal: (modal: AdminModal) => void;
  openModal: (modalType: AdminModal) => void;
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  jobForm: JobFormState;
  setJobForm: (form: JobFormState) => void;
  skillsInput: string;
  setSkillsInput: (input: string) => void;
  aiResumeFilterSkillsInput: string;
  setAiResumeFilterSkillsInput: (input: string) => void;
  currentJobId: string | null;
  setCurrentJobId: (id: string | null) => void;
  questionBanks: questionBankApi.QuestionBank[];
  setQuestionBanks: (banks: questionBankApi.QuestionBank[]) => void;
  isLoadingQuestionBanks: boolean;
  setIsLoadingQuestionBanks: (loading: boolean) => void;
  errorQuestionBanks: string | null;
  setErrorQuestionBanks: (error: string | null) => void;
  currentQuestionBankId: string | null;
  setCurrentQuestionBankId: (id: string | null) => void;
  questionBankForm: QuestionBankFormState;
  setQuestionBankForm: (form: QuestionBankFormState) => void;
  questionForm: { content: string };
  setQuestionForm: (form: { content: string }) => void;
  candidates: any[];
  setCandidates: (candidates: any[]) => void;
  isLoadingCandidates: boolean;
  setIsLoadingCandidates: (loading: boolean) => void;
  errorCandidates: string | null;
  setErrorCandidates: (error: string | null) => void;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  dashboardStats: {
    activeJobs: number;
    closedJobs: number;
    totalApplications: number;
    pendingResumes: number;
    pendingInterviews: number;
    monthlyApplications: number;
    monthlyGrowth: number;
  };
  setDashboardStats: (stats: any) => void;
  candidateForm: {
    name: string;
    phone: string;
    email: string;
    grade: string;
    major: string;
    positionId: string;
    teamId: string;
    resume: null;
  };
  setCandidateForm: (form: any) => void;
  notificationTemplates: any[];
  setNotificationTemplates: (templates: any[]) => void;
  isLoadingTemplates: boolean;
  setIsLoadingTemplates: (loading: boolean) => void;
  errorTemplates: string | null;
  setErrorTemplates: (error: string | null) => void;
  notificationForm: {
    type: string;
    trigger: string;
    content: string;
    name?: string;
    title?: string;
  };
  setNotificationForm: (form: any) => void;
  currentNotificationId: string | null;
  setCurrentNotificationId: (id: string | null) => void;
  viewModal: boolean;
  setViewModal: (modal: boolean) => void;
  currentCandidate: any;
  setCurrentCandidate: (candidate: any) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  menuTimeout: number | null;
  setMenuTimeout: (timeout: number | null) => void;
  fetchQuestionBanks: () => Promise<void>;
  fetchNotificationTemplates: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  fetchCandidates: (searchKeywordParam?: string, selectedStatusParam?: string) => Promise<void>;
  calculateDashboardStats: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    return (savedTab as AdminTab) || "dashboard";
  });

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    localStorage.setItem("adminActiveTab", tab);
  };
  const [modal, setModal] = useState<AdminModal>(null);

  const openModal = (modalType: AdminModal) => {
    setModal(modalType);
    if (modalType === "interview" && candidates.length === 0) {
      fetchCandidates();
    }
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    aiResumeFilter: false,
    aiResumeFilterScore: 60,
    aiResumeFilterSkills: [],
  });
  const [skillsInput, setSkillsInput] = useState<string>("");
  const [aiResumeFilterSkillsInput, setAiResumeFilterSkillsInput] = useState<string>("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  interface Question {
    id: string;
    content: string;
  }

  const [currentQuestionBankId, setCurrentQuestionBankId] = useState<string | null>(null);
  const [questionBankForm, setQuestionBankForm] = useState<QuestionBankFormState>({
    title: "",
    description: "",
    category: "",
    questionCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
    questions: [],
  });

  const [questionForm, setQuestionForm] = useState({
    content: "",
  });

  const [questionBanks, setQuestionBanks] = useState<questionBankApi.QuestionBank[]>([]);
  const [isLoadingQuestionBanks, setIsLoadingQuestionBanks] = useState<boolean>(false);
  const [errorQuestionBanks, setErrorQuestionBanks] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(false);
  const [errorCandidates, setErrorCandidates] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    pendingResumes: 0,
    pendingInterviews: 0,
    monthlyApplications: 0,
    monthlyGrowth: 0,
  });

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

  const [notificationTemplates, setNotificationTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [errorTemplates, setErrorTemplates] = useState<string | null>(null);

  const [notificationForm, setNotificationForm] = useState({
    type: "",
    trigger: "",
    content: "",
  });
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null);

  const [viewModal, setViewModal] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState<number | null>(null);

  useEffect(() => {
    const user = userApi.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const fetchQuestionBanks = async () => {
    setIsLoadingQuestionBanks(true);
    setErrorQuestionBanks(null);
    try {
      const response = await questionBankApi.getAllQuestionBanks();
      let questionBanks = response.data || [];
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

  useEffect(() => {
    if (currentUser?.team) {
      fetchQuestionBanks();
      fetchNotificationTemplates();
    }
  }, [currentUser]);

  const fetchNotificationTemplates = async () => {
    if (!currentUser?.team) return;

    setIsLoadingTemplates(true);
    setErrorTemplates(null);
    try {
      const response = await notificationTemplateApi.getTeamTemplates(
        currentUser.team,
      );
      setNotificationTemplates(response.data || []);
    } catch (err: any) {
      console.error("获取通知模板列表错误:", err);
      setErrorTemplates(err.message || "获取通知模板列表失败");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let jobList;
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
      if (Array.isArray(jobList)) {
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
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCandidates = async (
    searchKeywordParam: string = searchKeyword,
    selectedStatusParam: string = selectedStatus,
  ) => {
    setIsLoadingCandidates(true);
    setErrorCandidates(null);
    try {
      let candidateList;
      if (currentUser?.team) {
        candidateList = await applicationApi.getApplicationsByTeam(
          currentUser.team,
        );
      } else {
        candidateList = await applicationApi.getApplications();
      }

      const candidatesArray = Array.isArray(candidateList) ? candidateList : [];

      const filteredCandidates = candidatesArray.filter((candidate) => {
        if (selectedStatusParam) {
          if (selectedStatusParam === "rejected") {
            if (
              candidate.status !== "rejected" &&
              candidate.status !== "pending" &&
              candidate.status !== "screening" &&
              candidate.status !== "interview" &&
              candidate.status !== "offer" &&
              candidate.status !== "已通过预面试"
            ) {
              return true;
            } else {
              return false;
            }
          } else if (candidate.status !== selectedStatusParam) {
            return false;
          }
        }

        if (searchKeywordParam) {
          const keyword = searchKeywordParam.toLowerCase();
          return (
            (candidate.name || "").toLowerCase().includes(keyword) ||
            (candidate.email || "").toLowerCase().includes(keyword) ||
            (candidate.positionName || "").toLowerCase().includes(keyword) ||
            (candidate.major || "").toLowerCase().includes(keyword)
          );
        }

        return true;
      });

      setCandidates(filteredCandidates);
    } catch (err: any) {
      setErrorCandidates(err.message || "获取候选人列表失败");
      setCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const calculateDashboardStats = () => {
    const now = new Date();

    const activeJobs = jobs.filter(
      (job) => new Date(job.deadline) >= now,
    ).length;
    const closedJobs = jobs.filter(
      (job) => new Date(job.deadline) < now,
    ).length;

    const totalApplications = jobs.reduce(
      (sum, job) => sum + (job.applyCount || 0),
      0,
    );

    const pendingResumes = candidates.filter(
      (candidate) => candidate.status === "pending",
    ).length;

    const pendingInterviews = candidates.filter(
      (candidate) =>
        candidate.status === "screening" || candidate.status === "已通过预面试",
    ).length;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyApplications = candidates.filter(
      (candidate) => new Date(candidate.appliedAt) >= monthStart,
    ).length;

    const monthlyGrowth = 12.5;

    setDashboardStats({
      activeJobs,
      closedJobs,
      totalApplications,
      pendingResumes,
      pendingInterviews,
      monthlyApplications,
      monthlyGrowth,
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchJobs();
      fetchCandidates();
    }
  }, [currentUser]);

  useEffect(() => {
    calculateDashboardStats();
  }, [jobs, candidates]);

  useEffect(() => {
    if (currentUser && activeTab === "jobs") {
      fetchJobs();
    }
  }, [questionBanks, currentUser, activeTab]);

  const value: TeamContextType = {
    activeTab,
    setActiveTab,
    handleTabChange,
    modal,
    setModal,
    openModal,
    jobs,
    setJobs,
    isLoading,
    setIsLoading,
    error,
    setError,
    jobForm,
    setJobForm,
    skillsInput,
    setSkillsInput,
    aiResumeFilterSkillsInput,
    setAiResumeFilterSkillsInput,
    currentJobId,
    setCurrentJobId,
    questionBanks,
    setQuestionBanks,
    isLoadingQuestionBanks,
    setIsLoadingQuestionBanks,
    errorQuestionBanks,
    setErrorQuestionBanks,
    currentQuestionBankId,
    setCurrentQuestionBankId,
    questionBankForm,
    setQuestionBankForm,
    questionForm,
    setQuestionForm,
    candidates,
    setCandidates,
    isLoadingCandidates,
    setIsLoadingCandidates,
    errorCandidates,
    setErrorCandidates,
    searchKeyword,
    setSearchKeyword,
    selectedStatus,
    setSelectedStatus,
    dashboardStats,
    setDashboardStats,
    candidateForm,
    setCandidateForm,
    notificationTemplates,
    setNotificationTemplates,
    isLoadingTemplates,
    setIsLoadingTemplates,
    errorTemplates,
    setErrorTemplates,
    notificationForm,
    setNotificationForm,
    currentNotificationId,
    setCurrentNotificationId,
    viewModal,
    setViewModal,
    currentCandidate,
    setCurrentCandidate,
    currentUser,
    setCurrentUser,
    showUserMenu,
    setShowUserMenu,
    menuTimeout,
    setMenuTimeout,
    fetchQuestionBanks,
    fetchNotificationTemplates,
    fetchJobs,
    fetchCandidates,
    calculateDashboardStats,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}

export type { AdminTab, AdminModal, Job, JobFormState, Question, QuestionBankFormState };
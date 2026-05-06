import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { TeamProvider, useTeam } from "./TeamContext";
import positionApi from "../../api/positionApi";
import applicationApi from "../../api/applicationApi";
import * as questionBankApi from "../../api/questionBankApi";
import {
  notificationApi,
  notificationTemplateApi,
} from "../../api/notificationApi";

function TeamLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
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
  } = useTeam();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowUserMenu]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/team/jobs")) {
      setActiveTab("jobs");
    } else if (path.includes("/team/candidates")) {
      setActiveTab("candidates");
    } else if (path.includes("/team/questions")) {
      setActiveTab("questions");
    } else if (path.includes("/team/notifications")) {
      setActiveTab("notifications");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname, setActiveTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const tabItems: { key: string; label: string; path: string }[] = [
    { key: "dashboard", label: "团队仪表盘", path: "/team" },
    { key: "jobs", label: "职位管理", path: "/team/jobs" },
    { key: "candidates", label: "候选人管理", path: "/team/candidates" },
    { key: "questions", label: "面试题库", path: "/team/questions" },
    {
      key: "notifications",
      label: "消息通知管理",
      path: "/team/notifications",
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-700">
      <aside
        ref={sidebarRef}
        className="sticky top-0 h-screen w-64 border-r border-neutral-200 bg-white"
      >
        <div className="flex h-16 items-center border-b border-neutral-200 px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-neutral-800">
              AI招聘平台
            </span>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {tabItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    navigate(item.path);
                  }}
                  className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeTab === item.key
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-neutral-800">
              {tabItems.find((item) => item.key === activeTab)?.label ||
                "团队管理"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-neutral-100"
                onMouseEnter={() => {
                  if (menuTimeout) {
                    clearTimeout(menuTimeout);
                    setMenuTimeout(null);
                  }
                  setShowUserMenu(true);
                }}
                onMouseLeave={() => {
                  const timeout = window.setTimeout(() => {
                    setShowUserMenu(false);
                  }, 200);
                  setMenuTimeout(timeout);
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-sm font-medium text-primary-700">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {currentUser?.username || "用户"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
                  onMouseEnter={() => {
                    if (menuTimeout) {
                      clearTimeout(menuTimeout);
                      setMenuTimeout(null);
                    }
                    setShowUserMenu(true);
                  }}
                  onMouseLeave={() => {
                    const timeout = window.setTimeout(() => {
                      setShowUserMenu(false);
                    }, 200);
                    setMenuTimeout(timeout);
                  }}
                >
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    个人中心
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-100"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-800">
                {modal === "job" && (currentJobId ? "编辑职位" : "发布新职位")}
                {modal === "candidate" && "导入候选人"}
                {modal === "interview" && "安排面试"}
                {modal === "questionBank" &&
                  (currentQuestionBankId ? "编辑题库" : "添加题库")}
                {modal === "notification" &&
                  (currentNotificationId ? "编辑通知模板" : "添加通知模板")}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {modal === "job" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      职位名称
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="例如：前端开发工程师"
                      value={jobForm.title}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      职位类型
                    </label>
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
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      所属部门
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="例如：技术部"
                      value={jobForm.department}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, department: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      招聘人数
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="例如：5"
                      value={jobForm.quota}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          quota: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      薪资范围
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="例如：15k-25k"
                      value={jobForm.salary}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, salary: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      截止时间
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      value={jobForm.deadline}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, deadline: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    技能要求（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                    placeholder="例如：React,TypeScript,Node.js"
                    value={skillsInput}
                    onChange={(e) => {
                      setSkillsInput(e.target.value);
                      setJobForm({
                        ...jobForm,
                        requirements: {
                          ...jobForm.requirements,
                          skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    职位描述
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                    rows={4}
                    placeholder="请输入职位描述"
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
                </div>
                <div className="border-t border-neutral-200 pt-4">
                  <h4 className="text-md font-semibold text-neutral-800 mb-3">
                    AI预面试设置
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="aiPreInterview"
                        checked={jobForm.aiPreInterview}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            aiPreInterview: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="aiPreInterview"
                        className="ml-2 text-sm text-neutral-700"
                      >
                        启用AI预面试
                      </label>
                    </div>
                    {jobForm.aiPreInterview && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            选择面试题库
                          </label>
                          <select
                            className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                            value={jobForm.aiQuestionBankId}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                aiQuestionBankId: e.target.value,
                              })
                            }
                          >
                            <option value="">请选择题库</option>
                            {questionBanks.map((bank) => (
                              <option key={bank._id} value={bank._id}>
                                {bank.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            AI预面试最低通过分数
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
                                aiPreInterviewScore:
                                  parseInt(e.target.value) || 60,
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="border-t border-neutral-200 pt-4">
                  <h4 className="text-md font-semibold text-neutral-800 mb-3">
                    AI简历筛选设置
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="aiResumeFilter"
                        checked={jobForm.aiResumeFilter}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            aiResumeFilter: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="aiResumeFilter"
                        className="ml-2 text-sm text-neutral-700"
                      >
                        启用AI简历筛选
                      </label>
                    </div>
                    {jobForm.aiResumeFilter && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            AI简历筛选最低通过分数
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                            value={jobForm.aiResumeFilterScore}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                aiResumeFilterScore:
                                  parseInt(e.target.value) || 60,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            简历筛选关键词（用逗号分隔）
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                            placeholder="例如：React,TypeScript,Node.js"
                            value={aiResumeFilterSkillsInput}
                            onChange={(e) => {
                              setAiResumeFilterSkillsInput(e.target.value);
                              setJobForm({
                                ...jobForm,
                                aiResumeFilterSkills: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modal === "candidate" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      姓名
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="请输入姓名"
                      value={candidateForm.name}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      手机号
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="请输入手机号"
                      value={candidateForm.phone}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="请输入邮箱"
                      value={candidateForm.email}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      年级
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="请输入年级"
                      value={candidateForm.grade}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          grade: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      专业
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      placeholder="请输入专业"
                      value={candidateForm.major}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          major: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      应聘职位
                    </label>
                    <select
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      value={candidateForm.positionId}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          positionId: e.target.value,
                        })
                      }
                    >
                      <option value="">请选择职位</option>
                      {jobs.map((job) => (
                        <option key={job._id} value={job._id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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

            {modal === "notification" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="模板名称"
                  value={notificationForm.name || ""}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      name: e.target.value,
                    })
                  }
                />
                <select
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  value={notificationForm.type || ""}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="">选择通知类型</option>
                  <option value="resume_pass">简历通过筛选通知</option>
                  <option value="resume_reject">简历未通过通知</option>
                  <option value="interview_invite">面试邀请通知</option>
                  <option value="interview_reminder">面试提醒通知</option>
                  <option value="interview_result">面试结果通知</option>
                  <option value="offer">录用通知</option>
                  <option value="rejection">感谢信/拒绝信</option>
                </select>

                {notificationForm.type && (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <h4 className="text-sm font-medium text-neutral-800 mb-2">
                      可用变量：
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {notificationForm.type === "resume_pass" &&
                        ["{studentName}", "{positionName}", "{teamName}"].map(
                          (variable) => (
                            <span
                              key={variable}
                              className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                              {variable}
                            </span>
                          ),
                        )}
                      {notificationForm.type === "resume_reject" &&
                        [
                          "{studentName}",
                          "{positionName}",
                          "{teamName}",
                          "{rejectReason}",
                        ].map((variable) => (
                          <span
                            key={variable}
                            className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {variable}
                          </span>
                        ))}
                      {notificationForm.type === "interview_invite" &&
                        [
                          "{studentName}",
                          "{positionName}",
                          "{teamName}",
                          "{interviewTime}",
                          "{interviewLocation}",
                          "{interviewerName}",
                        ].map((variable) => (
                          <span
                            key={variable}
                            className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {variable}
                          </span>
                        ))}
                      {notificationForm.type === "interview_reminder" &&
                        [
                          "{studentName}",
                          "{positionName}",
                          "{teamName}",
                          "{interviewTime}",
                          "{interviewLocation}",
                        ].map((variable) => (
                          <span
                            key={variable}
                            className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {variable}
                          </span>
                        ))}
                      {notificationForm.type === "interview_result" &&
                        [
                          "{studentName}",
                          "{positionName}",
                          "{teamName}",
                          "{interviewResult}",
                          "{feedbackComment}",
                        ].map((variable) => (
                          <span
                            key={variable}
                            className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {variable}
                          </span>
                        ))}
                      {notificationForm.type === "offer" &&
                        [
                          "{studentName}",
                          "{positionName}",
                          "{teamName}",
                          "{onboardingTime}",
                          "{onboardingLocation}",
                          "{contactPerson}",
                        ].map((variable) => (
                          <span
                            key={variable}
                            className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {variable}
                          </span>
                        ))}
                      {notificationForm.type === "rejection" &&
                        ["{studentName}", "{teamName}", "{rejectReason}"].map(
                          (variable) => (
                            <span
                              key={variable}
                              className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                              {variable}
                            </span>
                          ),
                        )}
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      提示：在标题和内容中使用这些变量，系统会自动替换为实际值
                    </p>
                  </div>
                )}

                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="通知标题"
                  value={notificationForm.title || ""}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                />
                <textarea
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  rows={5}
                  placeholder="通知内容"
                  value={notificationForm.content || ""}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      content: e.target.value,
                    })
                  }
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
                    if (modal === "notification") {
                      if (!currentUser?.team) {
                        alert("请先选择团队");
                        return;
                      }

                      const templateData = {
                        teamId: currentUser.team,
                        type: notificationForm.type,
                        name: notificationForm.name,
                        title: notificationForm.title,
                        content: notificationForm.content,
                        variables: [],
                        status: "active",
                        createdBy: currentUser._id,
                      };

                      if (currentNotificationId) {
                        await notificationTemplateApi.updateTemplate(
                          currentNotificationId,
                          templateData,
                        );
                      } else {
                        await notificationTemplateApi.createTemplate(
                          templateData,
                        );
                      }

                      fetchNotificationTemplates();
                      setModal(null);
                    } else if (modal === "candidate") {
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
                      fetchCandidates();
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
                      const userStr = localStorage.getItem("user");
                      const user = userStr ? JSON.parse(userStr) : null;
                      const formData = {
                        title: questionBankForm.title,
                        type: "essay",
                        category: questionBankForm.category,
                        teamId: currentUser?.team || user?._id || "",
                        questions: questionBankForm.questions.map(
                          (q) => q.content,
                        ),
                      };
                      if (currentQuestionBankId) {
                        await questionBankApi.updateQuestionBank(
                          currentQuestionBankId,
                          formData,
                        );
                        window.message.success("题库更新成功");
                      } else {
                        await questionBankApi.createQuestionBank(formData);
                        window.message.success("题库创建成功");
                      }
                      fetchQuestionBanks();
                      setModal(null);
                    } else if (modal === "job") {
                      if (!jobForm.title || !jobForm.department) {
                        window.message.error("请填写职位名称和所属部门");
                        return;
                      }

                      const jobData = {
                        ...jobForm,
                        teamId: currentUser?.team || "",
                      };

                      if (currentJobId) {
                        await positionApi.updatePosition(currentJobId, jobData);
                        window.message.success("职位更新成功");
                      } else {
                        await positionApi.createPosition(jobData);
                        window.message.success("职位发布成功");
                      }
                      fetchJobs();
                      setModal(null);
                    }
                  } catch (err: any) {
                    console.error("操作失败:", err);
                    window.message.error(err.message || "操作失败");
                  }
                }}
                className="rounded-lg bg-primary-500 px-6 py-2.5 font-medium text-white hover:bg-primary-600"
              >
                {modal === "notification"
                  ? currentNotificationId
                    ? "更新"
                    : "创建"
                  : modal === "candidate"
                    ? "导入"
                    : modal === "questionBank"
                      ? currentQuestionBankId
                        ? "更新"
                        : "创建"
                      : modal === "job"
                        ? currentJobId
                          ? "更新"
                          : "发布"
                        : "确定"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModal && currentCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-800">
                候选人详情
              </h3>
              <button
                onClick={() => {
                  setViewModal(false);
                  setCurrentCandidate(null);
                }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    姓名
                  </label>
                  <p className="text-neutral-900">
                    {currentCandidate.name || currentCandidate.studentId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    邮箱
                  </label>
                  <p className="text-neutral-900">
                    {currentCandidate.email || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    年级
                  </label>
                  <p className="text-neutral-900">
                    {currentCandidate.grade || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    专业
                  </label>
                  <p className="text-neutral-900">
                    {currentCandidate.major || "-"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  应聘职位
                </label>
                <p className="text-neutral-900">
                  {currentCandidate.positionName || currentCandidate.positionId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  投递时间
                </label>
                <p className="text-neutral-900">
                  {new Date(currentCandidate.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  状态
                </label>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${currentCandidate.status === "pending" ? "bg-yellow-100 text-yellow-800" : currentCandidate.status === "screening" ? "bg-blue-100 text-blue-800" : currentCandidate.status === "interview" ? "bg-purple-100 text-purple-800" : currentCandidate.status === "offer" ? "bg-green-100 text-green-800" : currentCandidate.status === "已通过预面试" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {currentCandidate.status === "pending"
                    ? "待处理"
                    : currentCandidate.status === "screening"
                      ? "简历筛选"
                      : currentCandidate.status === "interview"
                        ? "面试中"
                        : currentCandidate.status === "offer"
                          ? "已录用"
                          : currentCandidate.status === "已通过预面试"
                            ? "已通过预面试"
                            : "已拒绝"}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setViewModal(false);
                  setCurrentCandidate(null);
                }}
                className="rounded-lg border border-neutral-300 px-6 py-2.5 font-medium text-neutral-700 hover:bg-neutral-100"
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

export default function Team() {
  return (
    <TeamProvider>
      <TeamLayout />
    </TeamProvider>
  );
}

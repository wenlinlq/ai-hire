import { useState, useEffect } from "react";
import { LogoMark } from "../../components/site";
import userApi from "../../api/userApi";
import teamApi from "../../api/teamApi";
import positionApi from "../../api/positionApi";
import type { User } from "../../api/userApi";
import ReactECharts from "echarts-for-react";

type TeamTab = "dashboard" | "user" | "team" | "stats" | "config";
type ModalType = "user" | "team" | null;
type UserModalType = "add" | "edit" | null;

interface UserFormState {
  username: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

const initialUserForm: UserFormState = {
  username: "",
  email: "",
  role: "student",
  team: "",
  status: "active",
};

function Team() {
  const [activeTab, setActiveTab] = useState<TeamTab>(() => {
    const savedTab = localStorage.getItem("teamActiveTab");
    return (savedTab as TeamTab) || "dashboard";
  });

  // 监听标签变化，保存到localStorage
  useEffect(() => {
    localStorage.setItem("teamActiveTab", activeTab);
  }, [activeTab]);

  // 获取当前用户信息
  useEffect(() => {
    const user = userApi.getCurrentUser();
    setCurrentUser(user);
  }, []);
  const [modal, setModal] = useState<ModalType>(null);
  const [userModal, setUserModal] = useState<UserModalType>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 当前用户信息
  const [currentUser, setCurrentUser] = useState<any>(null);
  // 下拉菜单显示状态
  const [showUserMenu, setShowUserMenu] = useState(false);
  // 延迟隐藏定时器
  const [menuTimeout, setMenuTimeout] = useState<number | null>(null);

  // 团队表单状态
  const [teamForm, setTeamForm] = useState({
    name: "",
    department: "",
    description: "",
    logo: "",
    leaderId: "",
    contact: {
      phone: "",
    },
  });

  // 团队列表状态
  const [teams, setTeams] = useState<any[]>([]);

  // 团队管理员列表状态
  const [teamAdmins, setTeamAdmins] = useState<any[]>([]);

  // 当前编辑的团队ID
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  // 团队列表（用于用户编辑弹框）
  const [userTeams, setUserTeams] = useState<any[]>([]);

  // 职位列表
  const [positions, setPositions] = useState<any[]>([]);

  // 获取用户列表
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userList = await userApi.getUsers();
      setUsers(userList);
    } catch (err: any) {
      setError(err.message || "获取用户列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取团队列表
  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const teamList = await teamApi.getTeams();
      // 获取所有用户，用于匹配总负责人和成员
      const userList = await userApi.getUsers();
      // 对每个团队添加leader信息和成员列表
      const teamsWithLeaderAndMembers = teamList.map((team) => {
        // 查找对应的用户
        const leader = userList.find((user) => user._id === team.leaderId);
        // 查找属于该团队的成员
        const members = userList.filter((user) => {
          if (!user.team) return false;
          // 处理team字段可能是对象或字符串的情况
          if (typeof user.team === "object" && user.team._id) {
            return user.team._id === team._id;
          } else {
            return user.team === team._id;
          }
        });
        return {
          ...team,
          leader: leader ? leader.username : "无",
          members: members,
        };
      });
      setTeams(teamsWithLeaderAndMembers);
    } catch (err: any) {
      setError(err.message || "获取团队列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取团队管理员列表
  const fetchTeamAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userList = await userApi.getUsers();
      // 过滤出角色为团队管理员的用户
      const admins = userList.filter((user) => user.role === "hr");
      setTeamAdmins(admins);
    } catch (err: any) {
      setError(err.message || "获取团队管理员列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取职位列表
  const fetchPositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const positionList = await positionApi.getPositions();
      setPositions(positionList);
    } catch (err: any) {
      setError(err.message || "获取职位列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "user") {
      fetchUsers();
      fetchTeams(); // 获取团队列表，用于用户编辑弹框和仪表盘显示
      fetchPositions(); // 获取职位列表，用于仪表盘显示
    } else if (activeTab === "team") {
      fetchTeams();
      fetchTeamAdmins();
    }
  }, [activeTab]);

  // 处理添加用户
  const handleAddUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await userApi.register({
        username: userForm.username,
        password: "123456", // 默认为123456，后续可以让用户修改
        email: userForm.email,
        role: userForm.role,
      });
      setUserModal(null);
      setUserForm(initialUserForm);
      fetchUsers(); // 重新获取用户列表
      fetchTeams(); // 重新获取团队列表，更新团队人数
    } catch (err: any) {
      setError(err.message || "添加用户失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理编辑用户
  const handleEditUser = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await userApi.updateUser(currentUserId, {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        team: userForm.team,
        status: userForm.status,
      });
      if (result.success) {
        setUserModal(null);
        setUserForm(initialUserForm);
        setCurrentUserId(null);
        fetchUsers(); // 重新获取用户列表
        fetchTeams(); // 重新获取团队列表，更新团队人数
      }
    } catch (err: any) {
      setError(err.message || "更新用户失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("确定要删除这个用户吗？")) return;
    setIsLoading(true);
    setError(null);
    try {
      await userApi.deleteUser(userId);
      fetchUsers(); // 重新获取用户列表
      fetchTeams(); // 重新获取团队列表，更新团队人数
    } catch (err: any) {
      setError(err.message || "删除用户失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 打开编辑团队模态框
  const openEditTeamModal = (team: any) => {
    setCurrentTeamId(team._id);
    setTeamForm({
      name: team.name,
      department: team.department,
      description: team.description,
      logo: team.logo,
      leaderId: team.leaderId,
      contact: {
        phone: team.contact.phone || "",
      },
    });
    setModal("team");
  };

  // 处理创建或编辑团队
  const handleCreateTeam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (currentTeamId) {
        // 编辑团队
        await teamApi.updateTeam(currentTeamId, {
          name: teamForm.name,
          department: teamForm.department,
          description: teamForm.description,
          leaderId: teamForm.leaderId,
          logo: teamForm.logo,
          contact: teamForm.contact,
        });
      } else {
        // 创建团队
        await teamApi.createTeam({
          name: teamForm.name,
          department: teamForm.department,
          description: teamForm.description,
          leaderId: teamForm.leaderId,
          logo: teamForm.logo,
          contact: teamForm.contact,
        });
      }
      // 成功后关闭模态框并重置表单
      setModal(null);
      setCurrentTeamId(null);
      setTeamForm({
        name: "",
        department: "",
        description: "",
        logo: "",
        leaderId: "",
        contact: {
          phone: "",
        },
      });
      // 重新获取团队列表
      fetchTeams();
    } catch (err: any) {
      setError(
        err.message || (currentTeamId ? "更新团队失败" : "创建团队失败"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除团队
  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm("确定要删除这个团队吗？")) {
      setIsLoading(true);
      setError(null);
      try {
        await teamApi.deleteTeam(teamId);
        // 成功后重新获取团队列表
        fetchTeams();
      } catch (err: any) {
        setError(err.message || "删除团队失败");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 打开编辑用户模态框
  const openEditModal = async (user: User) => {
    setCurrentUserId(user._id);
    // 处理team字段，确保它是字符串（团队ID）
    let teamValue = "";
    if (user.team) {
      teamValue =
        typeof user.team === "object" && user.team._id
          ? user.team._id
          : user.team;
    }
    setUserForm({
      username: user.username,
      email: user.email,
      role: user.role,
      team: teamValue,
      status: user.status,
    });
    setUserModal("edit");
  };

  // 打开添加用户模态框
  const openAddModal = () => {
    setUserForm(initialUserForm);
    setCurrentUserId(null);
    setUserModal("add");
  };

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
            团队管理
          </div>
          <ul className="space-y-1">
            {[
              ["dashboard", "仪表盘"],
              ["user", "用户管理"],
              ["team", "团队管理"],
              ["config", "系统配置"],
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  type="button"
                  className={`w-full border-r-4 px-4 py-3 text-left transition-colors ${
                    activeTab === key
                      ? "border-primary-500 bg-neutral-50 text-primary-500"
                      : "border-transparent hover:bg-neutral-50"
                  }`}
                  onClick={() => setActiveTab(key as TeamTab)}
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
          <h1 className="text-xl font-bold text-neutral-800">团队管理</h1>
          <div className="relative">
            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-100 rounded-lg px-2 py-1 transition-colors"
              onMouseEnter={() => {
                if (menuTimeout) clearTimeout(menuTimeout);
                setShowUserMenu(true);
              }}
              onMouseLeave={() => {
                const timeout = window.setTimeout(() => {
                  setShowUserMenu(false);
                }, 300);
                setMenuTimeout(timeout);
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                <span className="font-semibold text-primary-600">
                  {currentUser?.username
                    ? currentUser.username.charAt(0)
                    : "张"}
                </span>
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {currentUser?.username || "张经理"}
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
            </div>
            {/* 下拉菜单 - 添加延迟消失效果 */}
            <div
              className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50 transition-opacity duration-150 ${showUserMenu ? "opacity-100 visible" : "opacity-0 invisible"}`}
              onMouseEnter={() => {
                if (menuTimeout) clearTimeout(menuTimeout);
                setShowUserMenu(true);
              }}
              onMouseLeave={() => {
                const timeout = window.setTimeout(() => {
                  setShowUserMenu(false);
                }, 300);
                setMenuTimeout(timeout);
              }}
            >
              <button
                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                onClick={() => {
                  window.location.href = "/profile";
                }}
              >
                个人中心
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                onClick={() => {
                  userApi.logout();
                  window.location.href = "/login";
                }}
              >
                退出登录
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-800">仪表盘</h2>
              </div>

              {/* 核心指标卡片区 */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      平台总用户数
                    </h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-neutral-800">
                    {users.length}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    注册总人数（分角色统计）
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      近7日活跃用户
                    </h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600"
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
                  </div>
                  <p className="text-3xl font-bold text-neutral-800">
                    {users.filter((user) => user.status === "active").length}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    有登录/投递行为的用户数
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      入驻团队总数
                    </h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-neutral-800">
                    {teams.length}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    已审核通过的团队数量
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      进行中职位数
                    </h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-neutral-800">
                    {
                      positions.filter((position) => {
                        const now = new Date();
                        const deadline = new Date(position.deadline);
                        return deadline > now;
                      }).length
                    }
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    全平台开放岗位总数
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      总投递量
                    </h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-neutral-800">
                    {positions
                      .filter((position) => {
                        const now = new Date();
                        const deadline = new Date(position.deadline);
                        return deadline > now;
                      })
                      .reduce(
                        (total, position) => total + (position.applyCount || 0),
                        0,
                      )}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    累计简历投递次数
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      待审核团队
                    </h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.633-1.964-.633-2.732 0L3.34 16c-.77.633.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-neutral-800">3</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    新注册待审批的团队数量
                  </p>
                </div>
              </div>

              {/* 数据趋势图表区 */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {/* 平台整体活跃趋势 */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-3">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                    平台整体活跃趋势
                  </h3>
                  <ReactECharts
                    option={{
                      tooltip: {
                        trigger: "axis",
                      },
                      xAxis: {
                        type: "category",
                        data: [
                          "第1日",
                          "第2日",
                          "第3日",
                          "第4日",
                          "第5日",
                          "第6日",
                          "第7日",
                        ],
                      },
                      yAxis: {
                        type: "value",
                      },
                      series: [
                        {
                          data: [68, 74, 81, 76, 88, 92, 86],
                          type: "line",
                          smooth: true,
                          itemStyle: {
                            color: "#3b82f6",
                          },
                          lineStyle: {
                            width: 3,
                          },
                        },
                      ],
                    }}
                    style={{ height: "320px" }}
                  />
                  <p className="mt-4 text-sm text-neutral-500">
                    折线图：全平台用户活跃度趋势（登录/投递行为）
                  </p>
                  <p className="text-sm text-neutral-500">
                    作用：判断平台整体运营状况
                  </p>
                </div>

                {/* 各类型团队分布 */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                    各类型团队分布
                  </h3>
                  <ReactECharts
                    option={{
                      tooltip: {
                        trigger: "item",
                        formatter: "{a} <br/>{b}: {c} ({d}%)",
                      },
                      legend: {
                        orient: "vertical",
                        left: "left",
                        data: ["技术类", "宣传类", "外联类", "其他"],
                      },
                      series: [
                        {
                          name: "团队分布",
                          type: "pie",
                          radius: ["40%", "70%"],
                          avoidLabelOverlap: false,
                          itemStyle: {
                            borderRadius: 10,
                            borderColor: "#fff",
                            borderWidth: 2,
                          },
                          label: {
                            show: false,
                            position: "center",
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: 20,
                              fontWeight: "bold",
                            },
                          },
                          labelLine: {
                            show: false,
                          },
                          data: [
                            {
                              value: 70,
                              name: "技术类",
                              itemStyle: { color: "#3b82f6" },
                            },
                            {
                              value: 20,
                              name: "宣传类",
                              itemStyle: { color: "#10b981" },
                            },
                            {
                              value: 8,
                              name: "外联类",
                              itemStyle: { color: "#f59e0b" },
                            },
                            {
                              value: 2,
                              name: "其他",
                              itemStyle: { color: "#ef4444" },
                            },
                          ],
                        },
                      ],
                    }}
                    style={{ height: "256px" }}
                  />
                  <p className="mt-4 text-sm text-neutral-500">
                    饼图/柱状图：技术类 / 宣传类 / 外联类 / 其他
                  </p>
                  <p className="text-sm text-neutral-500">
                    作用：了解平台入驻团队的构成比例
                  </p>
                </div>

                {/* 投递量趋势 */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                    投递量趋势
                  </h3>
                  <ReactECharts
                    option={{
                      tooltip: {
                        trigger: "axis",
                      },
                      xAxis: {
                        type: "category",
                        data: [
                          "第1日",
                          "第2日",
                          "第3日",
                          "第4日",
                          "第5日",
                          "第6日",
                          "第7日",
                        ],
                      },
                      yAxis: {
                        type: "value",
                      },
                      series: [
                        {
                          data: [45, 52, 49, 63, 78, 82, 75],
                          type: "line",
                          smooth: true,
                          itemStyle: {
                            color: "#10b981",
                          },
                          lineStyle: {
                            width: 3,
                          },
                          areaStyle: {
                            color: {
                              type: "linear",
                              x: 0,
                              y: 0,
                              x2: 0,
                              y2: 1,
                              colorStops: [
                                {
                                  offset: 0,
                                  color: "rgba(16, 185, 129, 0.3)",
                                },
                                {
                                  offset: 1,
                                  color: "rgba(16, 185, 129, 0.05)",
                                },
                              ],
                            },
                          },
                        },
                      ],
                    }}
                    style={{ height: "256px" }}
                  />
                  <p className="mt-4 text-sm text-neutral-500">
                    折线图：全平台每日投递量变化
                  </p>
                  <p className="text-sm text-neutral-500">
                    作用：识别招新高峰期，做好系统扩容准备
                  </p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                {/* 待处理事项 */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      待处理事项
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-neutral-800">
                            待审核团队
                          </p>
                          <p className="text-xs text-neutral-500">
                            新注册待审批的团队
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-neutral-800 mr-4">
                          3
                        </span>
                        <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
                          处理
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.633-1.964-.633-2.732 0L3.34 16c-.77.633.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-neutral-800">
                            待处理举报
                          </p>
                          <p className="text-xs text-neutral-500">
                            用户提交的举报信息
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-neutral-800 mr-4">
                          2
                        </span>
                        <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
                          处理
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 快捷操作入口 */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      快捷操作
                    </h3>
                  </div>
                  <div className="grid gap-4 grid-cols-3">
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-neutral-800">
                        发布公告
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-neutral-800">
                        导出报表
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-neutral-800">
                        清除缓存
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === "user" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-800">
                  用户管理
                </h2>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="搜索用户"
                      className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none">
                      {["全部角色", "超级管理员", "团队管理员", "学生"].map(
                        (item) => (
                          <option key={item}>{item}</option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {["用户", "邮箱", "所属团队", "状态", "操作"].map(
                          (item) => (
                            <th key={item} className="px-6 py-3">
                              {item}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
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
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-neutral-500"
                          >
                            暂无用户
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                  <span className="font-semibold text-primary-600">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {user.username}
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    {user.role === "admin"
                                      ? "超级管理员"
                                      : user.role === "hr"
                                        ? (() => {
                                            const team = teams.find(
                                              (t) => t._id === user.team,
                                            );
                                            return team
                                              ? `团队管理员 (${team.name})`
                                              : "团队管理员 (无所属团队)";
                                          })()
                                        : "学生"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-900">
                              {(() => {
                                const team = teams.find(
                                  (t) => t._id === user.team,
                                );
                                return team ? team.name : "无";
                              })()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {user.status === "active" ? "活跃" : "未活跃"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                type="button"
                                className="mr-3 text-primary-600 hover:text-primary-900"
                                onClick={() => openEditModal(user)}
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteUser(user._id)}
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

          {activeTab === "team" && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  团队管理
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                  onClick={() => setModal("team")}
                >
                  创建团队
                </button>
              </div>

              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-neutral-500">加载中...</p>
                </div>
              ) : error ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : teams.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-neutral-500">暂无团队</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <div
                      key={team._id}
                      className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-neutral-800">
                          {team.name}
                        </h3>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          {Array.isArray(team.members)
                            ? `${team.members.length} 人`
                            : "0 人"}
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-neutral-600">
                        {team.description}
                      </p>
                      <div className="mb-4">
                        <p className="text-sm text-neutral-500">
                          总负责人: {team.leader || "无"}
                        </p>
                        <p className="text-sm text-neutral-500">
                          联系方式:{" "}
                          {typeof team.contact === "object"
                            ? team.contact.phone || "无"
                            : team.contact || "无"}
                        </p>
                      </div>
                      <div className="mb-4 flex items-center space-x-2">
                        {team.members &&
                          team.members.map((member, index) => {
                            // 检查member是否为对象
                            const memberName =
                              typeof member === "object" && member.username
                                ? member.username
                                : member;
                            return (
                              <div
                                key={index}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100"
                              >
                                <span className="font-semibold text-primary-600">
                                  {memberName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                      <div className="mt-auto flex justify-end space-x-2">
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => openEditTeamModal(team)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteTeam(team._id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "config" && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  系统配置
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                >
                  保存配置
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    基本设置
                  </h3>
                  <div className="space-y-4">
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2"
                      defaultValue="AI招聘平台"
                    />
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2"
                      defaultValue="contact@aihire.com"
                    />
                    <select className="w-full rounded-lg border border-neutral-300 px-4 py-2">
                      <option>简体中文</option>
                      <option>English</option>
                    </select>
                    <select className="w-full rounded-lg border border-neutral-300 px-4 py-2">
                      <option>Asia/Shanghai (UTC+8)</option>
                      <option>America/New_York (UTC-5)</option>
                      <option>Europe/London (UTC+0)</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    安全设置
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">
                        启用两步验证
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 accent-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">
                        密码复杂度要求
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 accent-primary-500"
                      />
                    </label>
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2"
                      defaultValue="90"
                    />
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2"
                      defaultValue="5"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {userModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">
                {userModal === "add" ? "添加用户" : "编辑用户"}
              </h3>
              <button
                type="button"
                className="text-neutral-500 hover:text-neutral-800"
                onClick={() => setUserModal(null)}
              >
                关闭
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  用户名
                </label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="请输入邮箱地址"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  角色
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="student">学生</option>
                  <option value="hr">团队管理员</option>
                  <option value="admin">超级管理员</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  所属团队
                </label>
                <select
                  value={userForm.team}
                  onChange={(e) =>
                    setUserForm({ ...userForm, team: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="">无</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              {userModal === "edit" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    状态
                  </label>
                  <select
                    value={userForm.status}
                    onChange={(e) =>
                      setUserForm({ ...userForm, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="active">活跃</option>
                    <option value="disabled">未活跃</option>
                  </select>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-lg border border-neutral-300 px-4 py-2"
                onClick={() => setUserModal(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary-500 px-4 py-2 text-white disabled:bg-primary-400 disabled:cursor-not-allowed"
                onClick={userModal === "add" ? handleAddUser : handleEditUser}
                disabled={isLoading}
              >
                {isLoading ? "处理中..." : "确认"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">
                {modal === "user"
                  ? "添加用户"
                  : currentTeamId
                    ? "编辑团队"
                    : "创建团队"}
              </h3>
              <button
                type="button"
                className="text-neutral-500 hover:text-neutral-800"
                onClick={() => setModal(null)}
              >
                关闭
              </button>
            </div>

            {modal === "user" ? (
              <div className="space-y-4">
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="用户姓名"
                />
                <input
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                  placeholder="邮箱地址"
                />
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3">
                  <option>学生</option>
                  <option>团队管理员</option>
                  <option>超级管理员</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    团队名称
                  </label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入团队名称"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    部门
                  </label>
                  <select
                    value={teamForm.department}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, department: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="">请选择部门</option>
                    <option value="产品部">产品部</option>
                    <option value="技术部">技术部</option>
                    <option value="设计部">设计部</option>
                    <option value="市场部">市场部</option>
                    <option value="人力资源部">人力资源部</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    团队描述
                  </label>
                  <textarea
                    value={teamForm.description}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    rows={4}
                    placeholder="请输入团队描述"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    团队Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // 这里可以添加文件上传逻辑
                        // 暂时将文件路径设置为文件名
                        setTeamForm({
                          ...teamForm,
                          logo: e.target.files[0].name,
                        });
                      }
                    }}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  {teamForm.logo && (
                    <p className="mt-2 text-sm text-neutral-500">
                      已选择文件: {teamForm.logo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    总负责人
                  </label>
                  <select
                    value={teamForm.leaderId}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, leaderId: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="">请选择总负责人</option>
                    {teamAdmins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.username} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    联系方式
                  </label>
                  <input
                    type="text"
                    value={teamForm.contact.phone}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        contact: {
                          ...teamForm.contact,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入手机号"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-lg border border-neutral-300 px-4 py-2"
                onClick={() => setModal(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary-500 px-4 py-2 text-white disabled:bg-primary-400 disabled:cursor-not-allowed"
                onClick={handleCreateTeam}
                disabled={isLoading}
              >
                {isLoading ? "处理中..." : "确认"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;

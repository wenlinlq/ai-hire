import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AdminProvider, useAdmin } from "./AdminContext";
import { LogoMark } from "../../components/site";
import userApi from "../../api/userApi";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeTab,
    setActiveTab,
    modal,
    setModal,
    userModal,
    setUserModal,
    userForm,
    setUserForm,
    currentUserId,
    setCurrentUserId,
    currentUser,
    setCurrentUser,
    showUserMenu,
    setShowUserMenu,
    menuTimeout,
    setMenuTimeout,
    teamForm,
    setTeamForm,
    teams,
    teamAdmins,
    currentTeamId,
    setCurrentTeamId,
    isLoading,
    error,
    setError,
    handleAddUser,
    handleEditUser,
    handleCreateTeam,
  } = useAdmin();

  const handleLogout = () => {
    userApi.logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/user")) {
      setActiveTab("user");
    } else if (path.includes("/admin/team")) {
      setActiveTab("team");
    } else if (path.includes("/admin/config")) {
      setActiveTab("config");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname, setActiveTab]);

  const tabItems: { key: string; label: string; path: string }[] = [
    { key: "dashboard", label: "仪表盘", path: "/admin" },
    { key: "user", label: "用户管理", path: "/admin/user" },
    { key: "team", label: "团队管理", path: "/admin/team" },
    { key: "config", label: "系统配置", path: "/admin/config" },
  ];

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
            {tabItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`w-full border-r-4 px-4 py-3 text-left transition-colors ${
                    activeTab === item.key
                      ? "border-primary-500 bg-neutral-50 text-primary-500"
                      : "border-transparent hover:bg-neutral-50"
                  }`}
                  onClick={() => navigate(item.path)}
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
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
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

            {modal === "team" && (
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
                    所属部门
                  </label>
                  <input
                    type="text"
                    value={teamForm.department}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, department: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入所属部门"
                  />
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
                    rows={3}
                    placeholder="请输入团队描述"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    团队负责人
                  </label>
                  <select
                    value={teamForm.leaderId}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, leaderId: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="">请选择负责人</option>
                    {teamAdmins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    联系电话
                  </label>
                  <input
                    type="text"
                    value={teamForm.contact.phone}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        contact: { phone: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入联系电话"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                  </div>
                )}
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
                {isLoading ? "处理中..." : currentTeamId ? "更新" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
}

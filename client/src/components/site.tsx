import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import userApi from "../api/userApi";

type SiteNavProps = {
  current?: "home" | "hall" | "resume" | "interview" | "profile";
};

const navItems = [
  { key: "home", label: "首页", to: "/" },
  { key: "hall", label: "招新大厅", to: "/hall" },
  { key: "resume", label: "AI简历", to: "/resume" },
  { key: "interview", label: "AI模拟面试", to: "/interview" },
] as const;

const jobServiceLinks = ["职位搜索", "简历优化", "AI模拟面试", "职业规划"];
const employerLinks = ["发布职位", "人才搜索", "AI简历筛选", "招聘解决方案"];

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function SiteNav({ current }: SiteNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [unreadCount, setUnreadCount] = useState(3);
  const navigate = useNavigate();
  const user = userApi.getCurrentUser();
  const isLoggedIn = userApi.isLoggedIn();

  const handleLogout = () => {
    userApi.logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleMouseEnter = () => {
    // 清除之前的定时器
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
    // 立即显示下拉菜单
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // 设置300ms延时后隐藏下拉菜单
    const timer = setTimeout(() => {
      setIsDropdownOpen(false);
      setDropdownTimer(null);
    }, 300);
    setDropdownTimer(timer);
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary-700 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <LogoMark />
          <span className="text-xl font-bold">AI招聘</span>
        </Link>

        <div className="hidden space-x-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive || current === item.key
                    ? "text-primary-200"
                    : "hover:text-primary-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {isLoggedIn ? (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/10">
              <div className="relative h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                {user?.username.charAt(0).toUpperCase()}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">{user?.username}</span>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg text-neutral-800 py-2 z-10"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/notifications"
                  className="block px-4 py-2 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>消息通知</span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-neutral-100 transition-colors"
                >
                  个人中心
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 transition-colors"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="rounded-lg border border-white/30 px-4 py-2 transition-colors hover:bg-white/10"
            >
              登录
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-primary-500 px-4 py-2 transition-colors hover:bg-primary-600"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-neutral-800 py-12 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <LogoMark className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold text-white">AI招聘</span>
            </div>
            <p className="text-sm">智能连接人才与未来，让招聘更高效、更精准</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">求职服务</h4>
            <ul className="space-y-2 text-sm">
              {jobServiceLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-primary-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">企业服务</h4>
            <ul className="space-y-2 text-sm">
              {employerLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-primary-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">联系我们</h4>
            <ul className="space-y-2 text-sm">
              <li>客服热线：400-888-8888</li>
              <li>邮箱：contact@aihire.com</li>
              <li>地址：北京市朝阳区科技园区</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-700 pt-8 text-center text-sm">
          <p>2024 AI招聘平台 版权所有</p>
        </div>
      </div>
    </footer>
  );
}

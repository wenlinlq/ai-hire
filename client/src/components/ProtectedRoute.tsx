import { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import userApi from "../api/userApi";

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);
  const isLoggedIn = userApi.isLoggedIn();
  const currentUser = userApi.getCurrentUser();

  // 检查登录状态和权限
  useEffect(() => {
    if (!isLoggedIn && location.pathname !== "/") {
      alert("您需要先登录才能访问该页面");
    }
    setIsChecked(true);
  }, [isLoggedIn, location.pathname]);

  // 等待检查完成后再进行重定向
  if (!isChecked) {
    return null;
  }

  // 如果用户未登录，重定向到登录页面
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 角色权限检查
  const userRole = currentUser?.role;
  const userTeam = currentUser?.team;
  const isAdminPage = location.pathname.startsWith("/admin");
  const isTeamPage = location.pathname.startsWith("/team");

  // 普通用户(student)不能访问admin和team页面
  if (userRole === "student" && (isAdminPage || isTeamPage)) {
    alert("您没有权限访问该页面");
    return <Navigate to="/" replace />;
  }

  // 团队管理员(hr)不能访问admin页面
  if (userRole === "hr" && isAdminPage) {
    alert("您没有权限访问该页面");
    return <Navigate to="/team" replace />;
  }

  // 团队管理员(hr)无所属团队时，允许访问team页面但显示空数据提示
  // 提示信息在team页面内部显示

  // 如果用户已登录且有权限，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;

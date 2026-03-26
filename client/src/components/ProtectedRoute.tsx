import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import userApi from "../api/userApi";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);
  const isLoggedIn = userApi.isLoggedIn();

  // 检查登录状态并显示提示
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

  // 如果用户已登录，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;

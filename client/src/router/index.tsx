/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const Admin = lazy(() => import("../page/admin"));
const Hall = lazy(() => import("../page/hall"));
const Home = lazy(() => import("../page/home"));
const Interview = lazy(() => import("../page/interview"));
const Login = lazy(() => import("../page/login"));
const Profile = lazy(() => import("../page/profile"));
const Team = lazy(() => import("../page/team"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={null}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/hall",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <Hall />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/interview",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <Interview />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <Profile />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/team",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <Team />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;

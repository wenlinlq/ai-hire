/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const Admin = lazy(() => import("../page/admin"));
const Hall = lazy(() => import("../page/hall"));
const JobDetail = lazy(() => import("../page/hall/detail"));
const Home = lazy(() => import("../page/home"));
const Interview = lazy(() => import("../page/interview"));
const AIInterview = lazy(() => import("../page/interview/ai-interview"));
const Login = lazy(() => import("../page/login"));
const Notifications = lazy(() => import("../page/notifications"));
const NotificationDetail = lazy(() => import("../page/notifications/detail"));
const Profile = lazy(() => import("../page/profile"));
const Team = lazy(() => import("../page/team"));
const ResumeAnalyze = lazy(() => import("../page/resume"));

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
    path: "/hall/:id",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <JobDetail />
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
    path: "/ai-interview",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <AIInterview />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <ResumeAnalyze />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <Notifications />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications/:id",
    element: (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <NotificationDetail />
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

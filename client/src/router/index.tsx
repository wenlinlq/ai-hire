/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

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
      <Suspense fallback={null}>
        <Hall />
      </Suspense>
    ),
  },
  {
    path: "/interview",
    element: (
      <Suspense fallback={null}>
        <Interview />
      </Suspense>
    ),
  },
  {
    path: "/profile",
    element: (
      <Suspense fallback={null}>
        <Profile />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ),
  },
  {
    path: "/team",
    element: (
      <Suspense fallback={null}>
        <Team />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;

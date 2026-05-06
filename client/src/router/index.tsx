/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const Admin = lazy(() => import("../page/admin"));
const AdminDashboard = lazy(() => import("../page/admin/AdminDashboard"));
const AdminUser = lazy(() => import("../page/admin/AdminUser"));
const AdminTeam = lazy(() => import("../page/admin/AdminTeam"));
const AdminConfig = lazy(() => import("../page/admin/AdminConfig"));
const Hall = lazy(() => import("../page/hall"));
const JobDetail = lazy(() => import("../page/hall/detail"));
const Home = lazy(() => import("../page/home"));
const InterviewPreparation = lazy(
  () => import("../page/interview/preparation"),
);
const InterviewConversation = lazy(
  () => import("../page/interview/conversation"),
);
const InterviewSummary = lazy(() => import("../page/interview/summary"));
const AIInterview = lazy(() => import("../page/interview/ai-interview"));
const AIChat = lazy(() => import("../page/ai-chat"));
const Login = lazy(() => import("../page/login"));
const Notifications = lazy(() => import("../page/notifications"));
const NotificationDetail = lazy(() => import("../page/notifications/detail"));
const Profile = lazy(() => import("../page/profile"));
const ProfileInfo = lazy(() => import("../page/profile/ProfileInfo"));
const MyResume = lazy(() => import("../page/profile/MyResume"));
const MyInterviews = lazy(() => import("../page/profile/MyInterviews"));
const FavoriteJobs = lazy(() => import("../page/profile/FavoriteJobs"));
const Team = lazy(() => import("../page/team"));
const TeamDashboard = lazy(() => import("../page/team/TeamDashboard"));
const TeamJobs = lazy(() => import("../page/team/TeamJobs"));
const TeamCandidates = lazy(() => import("../page/team/TeamCandidates"));
const TeamQuestions = lazy(() => import("../page/team/TeamQuestions"));
const TeamNotifications = lazy(() => import("../page/team/TeamNotifications"));
const ResumeAnalyze = lazy(() => import("../page/resume"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={null}>
            <Home />
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
        path: "/hall/:id",
        element: (
          <Suspense fallback={null}>
            <JobDetail />
          </Suspense>
        ),
      },
      {
        path: "/interview",
        element: (
          <Suspense fallback={null}>
            <InterviewPreparation />
          </Suspense>
        ),
      },
      {
        path: "/interview/conversation",
        element: (
          <Suspense fallback={null}>
            <InterviewConversation />
          </Suspense>
        ),
      },
      {
        path: "/interview/summary",
        element: (
          <Suspense fallback={null}>
            <InterviewSummary />
          </Suspense>
        ),
      },
      {
        path: "/ai-interview/:id",
        element: (
          <Suspense fallback={null}>
            <AIInterview />
          </Suspense>
        ),
      },
      {
        path: "/ai-interview",
        element: <Navigate to="/" replace />,
      },
      {
        path: "/resume",
        element: (
          <Suspense fallback={null}>
            <ResumeAnalyze />
          </Suspense>
        ),
      },
      {
        path: "/notifications",
        element: (
          <Suspense fallback={null}>
            <Notifications />
          </Suspense>
        ),
      },
      {
        path: "/notifications/:id",
        element: (
          <Suspense fallback={null}>
            <NotificationDetail />
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
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={null}>
                <ProfileInfo />
              </Suspense>
            ),
          },
          {
            path: "resume",
            element: (
              <Suspense fallback={null}>
                <MyResume />
              </Suspense>
            ),
          },
          {
            path: "interviews",
            element: (
              <Suspense fallback={null}>
                <MyInterviews />
              </Suspense>
            ),
          },
          {
            path: "favorites",
            element: (
              <Suspense fallback={null}>
                <FavoriteJobs />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/admin",
        element: (
          <Suspense fallback={null}>
            <Admin />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={null}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: "user",
            element: (
              <Suspense fallback={null}>
                <AdminUser />
              </Suspense>
            ),
          },
          {
            path: "team",
            element: (
              <Suspense fallback={null}>
                <AdminTeam />
              </Suspense>
            ),
          },
          {
            path: "config",
            element: (
              <Suspense fallback={null}>
                <AdminConfig />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/team",
        element: (
          <Suspense fallback={null}>
            <Team />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={null}>
                <TeamDashboard />
              </Suspense>
            ),
          },
          {
            path: "jobs",
            element: (
              <Suspense fallback={null}>
                <TeamJobs />
              </Suspense>
            ),
          },
          {
            path: "candidates",
            element: (
              <Suspense fallback={null}>
                <TeamCandidates />
              </Suspense>
            ),
          },
          {
            path: "questions",
            element: (
              <Suspense fallback={null}>
                <TeamQuestions />
              </Suspense>
            ),
          },
          {
            path: "notifications",
            element: (
              <Suspense fallback={null}>
                <TeamNotifications />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/ai-chat",
        element: (
          <Suspense fallback={null}>
            <AIChat />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;

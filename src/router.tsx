import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/app/features/auth/components/protected-route/ProtectedRoute";
import { LoginPage } from "@/app/features/auth/pages/login/LoginPage";
import { ForgotPasswordPage } from "./app/features/auth/pages/forgot-password/ForgotPasswordPage";
import { AppLayout } from "./app/layout/AppLayout";
import { DashboardPage } from "./app/features/dashboard/pages/DashboardPage";
import { OwnerRoute } from "./app/features/auth/components/owner-route/OwnerRoute";
import { UsersPage } from "./app/features/users/pages/UsersPage";
import { ProjectsPage } from "./app/features/projects/pages/ProjectsPage";
import { ProjectAdminRoute } from "./app/features/auth/components/project-admin-route/ProjectAdminRoute";
import { CreateProjectPage } from "./app/features/projects/pages/CreateProjectPage";
import { ProjectDetailPage } from "./app/features/projects/pages/ProjectDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          {
            path: "/projects",
            element: <ProjectsPage />
          },
          {
            path: "projects/:projectId",
            element: <ProjectDetailPage />
          },
          {
            element: <ProjectAdminRoute />,
            children: [
              {
                path: "/projects/new",
                element: <CreateProjectPage />,
              },
            ],
          },
          {
            element: <OwnerRoute />,
            children: [
              {
                path: "/users",
                element: <UsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

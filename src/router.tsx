import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/app/features/auth/components/protected-route/ProtectedRoute";
import { LoginPage } from "@/app/features/auth/pages/login/LoginPage";
import { ForgotPasswordPage } from "./app/features/auth/pages/forgot-password/ForgotPasswordPage";
import { AppLayout } from "./app/layout/AppLayout";
import { DashboardPage } from "./app/features/dashboard/pages/DashboardPage";
// import { AppLayout } from "@/app/layout/AppLayout";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/dashboard", element: <DashboardPage /> }],
      },
    ],
  },
]);

import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/app/features/auth/pages/login/LoginPage";
import { ForgotPasswordPage } from "./app/features/auth/pages/forgot-password/ForgotPasswordPage";
// import { AppLayout } from "@/app/layout/AppLayout";

export const router = createBrowserRouter([
    {path: "/", element: <LoginPage />},
    {path: "/auth/forgot-password", element: <ForgotPasswordPage />},

    // Rutas de la aplicación: comparten el layout principal
    // {
    //     element: <AppLayout />,
    //     children: [
    //         {
    //             path: "/dashboard",
    //             element: <DashboardPage />,
    //         },
    //         {
    //             path: "/projects",
    //             element: <ProjectsPage />,
    //         }
    //     ]
    // }
])
import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/login/LoginPage";


export const router = createBrowserRouter([
    { path: "/", element: <LoginPage />},
])
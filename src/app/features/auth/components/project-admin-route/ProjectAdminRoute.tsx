import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "@/app/features/auth/context/auth-context";


export const ProjectAdminRoute = () => {
  const { user } = useAuth();

  const canManageProjects =
    user?.role === "owner" ||
    user?.role === "architect";

  if (!canManageProjects) {
    return (
      <Navigate
        to="/projects"
        replace
      />
    );
  }

  return <Outlet />;
};
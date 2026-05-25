import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";

const AdminRoute = () => {
  const { user, isAdmin, authLoading } = useAppContext();

  if (authLoading) return <Loading fullScreen />;

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { user, authLoading, setShowUserLogin } = useAppContext();

  if (authLoading) return <Loading fullScreen />;

  // Block both unauthenticated guests AND active administrative staff accounts
  if (!user || user.isStaff) {
    // Open Google Login modal and redirect to storefront home
    setTimeout(() => setShowUserLogin(true), 100);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

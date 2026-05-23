import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";

const ProtectedRoute = () => {
  return <Outlet />;
};

export default ProtectedRoute;

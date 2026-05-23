import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";

const AdminRoute = () => {
  return <Outlet />;
};

export default AdminRoute;

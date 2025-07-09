import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "../admin/LoginForm";
import ForgotPassword from "../admin/ForgotPassword";
import Dashboard from "../admin/DashBoard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

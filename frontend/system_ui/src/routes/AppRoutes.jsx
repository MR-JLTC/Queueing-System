import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "../admin/LoginForm";
import SA_LoginForm from "../super-admin/SA_LoginForm";
import SA_ForgotPassword from "../super-admin/SA_ForgotPassword";
import ForgotPassword from "../admin/ForgotPassword";
import Dashboard from "../admin/DashBoard";
import CounterQueueManagementSystem from "../counter/CounterQueueManagement";
// Client page
import QueueManagement from '../client/QueueManagement';
import QueueMonitoring from "../admin/QueueMonitoring";
import ProtectedRoute from "./ProtectedRoute"; // adjust the path if needed
import SuperAdminSignup from "../super-admin/SA_SignupForm"; // Import the new signup form

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/Adminlogin" element={<LoginForm />} />
      <Route path="/AdminForgot" element={<ForgotPassword />} />
      <Route path="/SuperAdminlogin" element={<SA_LoginForm />} />
      <Route path="/SuperAdminForgot" element={<SA_ForgotPassword  />} />
      <Route path="/SuperAdminSignup" element={<SuperAdminSignup />} />
      <Route
        path="/AdminDashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/counter" element={<CounterQueueManagementSystem />} />
      <Route path="/monitoring" element={<QueueMonitoring />} />
      <Route path="/queue" element={<QueueManagement />} /> {/* ✅ new route */}
      <Route path="*" element={<Navigate to="/Adminlogin" />} />
      {/* <Route path="/" element={<Navigate to="/login" />} /> */}
    </Routes>
  );
};
export default AppRoutes;

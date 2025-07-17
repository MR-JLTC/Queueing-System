import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "../admin/LoginForm";
import ForgotPassword from "../admin/ForgotPassword";
import Dashboard from "../admin/DashBoard";
import CounterQueueManagementSystem from "../counter/CounterQueueManagement";
// Client page
import QueueManagement from '../client/QueueManagement';
import QueueMonitoring from "../admin/QueueMonitoring";
import ProtectedRoute from "./ProtectedRoute"; // adjust the path if needed

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/counter" element={<CounterQueueManagementSystem />} />
      <Route path="/monitoring" element={<QueueMonitoring />} />
      <Route path="/queue" element={<QueueManagement />} /> {/* ✅ new route */}
    <Route path="*" element={<Navigate to="/login" />} />
    <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};
export default AppRoutes;

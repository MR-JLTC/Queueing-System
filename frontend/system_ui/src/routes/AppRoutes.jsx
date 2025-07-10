import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "../admin/LoginForm";
import ForgotPassword from "../admin/ForgotPassword";
import Dashboard from "../admin/DashBoard";
import CounterQueueManagementSystem from "../counter/CounterQueueManagement";
// Client page
import QueueManagement from '../client/QueueManagement';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/counter" element={<CounterQueueManagementSystem />} />
      {/* Client Routes */}
      <Route path="/queue" element={<QueueManagement />} /> {/* ✅ new route */}
      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

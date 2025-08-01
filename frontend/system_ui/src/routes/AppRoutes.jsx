// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import your existing components
import LoginForm from "../admin/LoginForm";
import SA_LoginForm from "../super-admin/SA_LoginForm";
import SA_ForgotPassword from "../super-admin/SA_ForgotPassword";
import ForgotPassword from "../admin/ForgotPassword";
import Dashboard from "../admin/DashBoard"; // General Admin Dashboard
import CounterQueueManagementSystem from "../counter/CounterQueueManagement";
import QueueManagement from '../client/QueueManagement';
import QueueMonitoring from "../admin/QueueMonitoring";
import SuperAdminSignup from "../super-admin/SA_SignupForm";

// Import ProtectedRoute and the new SuperAdminDashboard
import ProtectedRoute from "./ProtectedRoute";
import SuperAdminDashboard from '../super-admin/SuperAdminDashboard'; // Your new Super Admin Dashboard component
import QueueDisplay from '../QueueMonitoring/QueueDisplay';
import QueueChecker from '../queueAppSite/QueueChecker'; // Import your CSS for styling

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/Adminlogin" element={<LoginForm />} />
      <Route path="/AdminForgot" element={<ForgotPassword />} />
      <Route path="/SuperAdminlogin" element={<SA_LoginForm />} />
      <Route path="/SuperAdminForgot" element={<SA_ForgotPassword />} />
      <Route path="/SuperAdminSignup" element={<SuperAdminSignup />} />

      {/* Protected Route for General Admin Dashboard */}
      <Route
        path="/AdminDashboard"
        element={
          // Assuming '2' is the roleId for a general Admin. Adjust if needed.
          // If any logged-in user can access, remove allowedRoles prop.
          <ProtectedRoute allowedRoles={["2"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Route for Super Admin Dashboard */}
      <Route
        path="/SuperAdminDashboard"
        element={
          <ProtectedRoute allowedRoles={["1"]}> {/* Only roleId "1" (Super Admin) can access */}
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Other existing routes */}
      <Route path="/counter" element={<CounterQueueManagementSystem />} />
      <Route path="/monitoring" element={<QueueMonitoring />} />
      <Route path="/queue" element={<QueueManagement />} />
      <Route path="/queue-display" element={<QueueDisplay />} />
      <Route path="/queue-checker" element={<QueueChecker />} />
      {/* Default redirect to SuperAdminlogin if no other route matches */}
      <Route path="*" element={<Navigate to="/SuperAdminlogin" />} />
    </Routes>
  );
};

export default AppRoutes;

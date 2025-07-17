// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true"; // or your token logic
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

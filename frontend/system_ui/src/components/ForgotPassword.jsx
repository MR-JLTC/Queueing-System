import React, { useState } from "react";
import logo from "../assets/bahandi_logo.png";
import "./ForgotPassword.css"; // or LoginForm.css kung irename nimo

const LoginForm = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <h2>Welcome to Bahandi</h2>
      </div>

      <div className="forgot-password-content">
        <div className="logo-section">
          <div className="logo">
            <img src={logo} alt="Bahandi Logo" />
          </div>
        </div>

        <div className="verification-form">
          <h3>Log in to access your dashboard and settings.</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button type="submit">Login</button>
          </form>

          <button type="button" className="back-button" onClick={onBackToLogin}>
            Don't have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

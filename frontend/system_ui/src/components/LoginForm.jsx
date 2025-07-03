import React, { useState } from 'react';
import './LoginForm.css';


const LoginForm = ({ onForgotPassword, onGoToSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // Add your login logic here
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

 return (
  <>
    <div className="login-page">
      <div className="header-section">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="inter-font">Welcome to Bahandi</h1>
          <p>Please log in to your account using the form below.</p>
        </div>
      </div>

      <div className="login-container">

        <div className="form-group horizontal">
          <label className="input-label">
            <span className="input-icon">👤</span> Username:
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group horizontal">
          <label className="input-label">
            <span className="input-icon">✉️</span> Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group horizontal">
          <label className="input-label">
            <span className="input-icon">🔒</span> Password:
          </label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="forgot-password-link">
          <button
            type="button"
            className="link-button"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="login-button" onClick={handleSubmit}>
          Login
        </button>

        <div className="signup-link">
          <span>Don't have an account?  </span>
          <button
            type="button"
            className="link-button"
            onClick={onGoToSignup}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  </>
);

};

export default LoginForm;
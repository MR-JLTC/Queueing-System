import React, { useState } from 'react';
import './SignupForm.css';

const SignupForm = ({ onGoToLogin }) => {
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
    console.log('Signup attempt:', formData);
    // Add your signup logic here
    // After successful signup, you might want to redirect to login or dashboard
    // For now, we'll just log the attempt
    alert('Signup successful! You can now log in.');
    onGoToLogin(); // Navigate back to login after successful signup
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/logo.png" alt="Bahandi Logo" />
          </div>
          <h1>SIGN UP</h1>
          <p>Kindly fill up the form to get started.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
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

          <button type="submit" className="signup-button">
            Sign Up
          </button>

          <div className="login-link">
            <span>Already have an account? </span>
            <button
              type="button"
              className="link-button"
              onClick={onGoToLogin}
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
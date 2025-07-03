import React, { useState } from 'react';
import './SignupForm.css';

const SignupForm = ({ onGoToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
     confirmPassword: ''
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
    alert('Signup successful! You can now log in.');
    onGoToLogin();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    
      <div className="signup-page">
      <div className="header-section">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="inter-font">SIGN UP</h1>
          <p className="inter-font2">Kindly fill up the form to get started.</p>
        </div>
        </div>

          <div className="signup-container">

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

       <div className="form-group horizontal">
  <div className="confirm-password-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleInputChange}
      placeholder="Confirm Password"
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
      </div>
    </div>
  );
};

export default SignupForm;
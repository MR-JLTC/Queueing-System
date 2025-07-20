import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import showIcon from '../assets/visibility_on.svg';
import hideIcon from '../assets/visibility_off.svg';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import { useEffect } from 'react';

const LoginForm = () => {
  useEffect(() => {
  localStorage.setItem("isLoggedIn", "false");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true }); // Prevent back navigation
    }
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [popup, setPopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // const validUsername = 'admin';
    const validPassword = '1234';
    const validEmail = 'admin@gmail.com';

    if (
      // formData.username === validUsername &&
      formData.password === validPassword &&
      formData.email === validEmail
    ) {
      showPopupMessage(setPopup, "success", "Login successful!");
      localStorage.setItem("isLoggedIn", "true");
      console.log("Value: " + localStorage.getItem("isLoggedIn"));
      setTimeout(() => navigate('/AdminDashboard'), 700);
    } else {
      localStorage.setItem("isLoggedIn", "false");
      showPopupMessage(setPopup, "error", "Invalid credentials. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="header-section2">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="inter-font">
            <span style={{ color: 'white' }}>Welcome to </span><span style={{ color: 'yellow' }}>QLine</span>
          </h1>
          <p>Please log in to your account using the form below.</p>
        </div>
      </div>
      <form className="login-container" onSubmit={handleSubmit}>
        {/* <div className="form-group horizontal">
          <label className="input-label">
            <img src="/src/assets/person.svg" alt="Username Icon" className="input-icon-svg" />
            Username:
          </label>
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
        </div> */}
        <div className="form-group horizontal">
          <label className="email-label">
            <img src="/src/assets/mail.svg" alt="Mail Icon" className="input-icon-svg" />
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            pattern=".+@.+\..+"
            title="Please enter a valid email address that includes a '.'"
          />
        </div>
        <div className="form-group horizontal">
          <label className="input-label">
            <img src="/src/assets/lock.svg" alt="Password Icon" className="input-icon-svg" />
            Password:
          </label>
          {/* Apply the new wrapper div here */}
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              maxLength={9}
            />
            <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
              <img
                src={showPassword ? showIcon : hideIcon}
                alt={showPassword ? "Hide password" : "Show password"}
                className="password-icon"
              />
            </button>
          </div>
        </div>
        <div className="forgot-password-link">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/AdminForgot')}
          >
            Forgot password?
          </button>
        </div>
        <button type="submit" className="login-button">Login</button>
        <div className="powered-by">
          <p>
            Powered by{' '}
            <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" className="input-icon-svg" />
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
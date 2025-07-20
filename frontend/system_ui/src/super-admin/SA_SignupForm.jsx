import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SA_SignupForm.css'; // Importing the new CSS file
import showIcon from '../assets/visibility_on.svg';
import hideIcon from '../assets/visibility_off.svg';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Removed username from formData state
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [popup, setPopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showPopupMessage(setPopup, "error", "Passwords do not match!");
      return;
    }

    console.log("Signup Data:", formData);
    showPopupMessage(setPopup, "success", "Account created successfully! Please log in.");
    
    setTimeout(() => navigate('/superadminlogin'), 1500); 
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="sa_signup-page_sf"> {/* Updated class name */}
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="sa_header-section2_sf"> {/* Updated class name */}
        <div className="sa_logo-section_sf">
          <div className="sa_logo_sf"> {/* Updated class name */}
            <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="sa_inter-font_sf"> {/* Updated class name */}
            <span style={{ color: 'white' }}>Super Admin Sign Up Portal</span>
          </h1>
          <p>Kindly fill up the form to get started.</p>
        </div>
      </div>
      <form className="sa_login-container_sf" onSubmit={handleSubmit}> {/* Updated class name */}
        {/* Removed Username Input Field */}
        {/*
        <div className="sa_form-group horizontal_sf">
          <label className="sa_input-label_sf">
            <img src="/src/assets/person.svg" alt="Username Icon" className="sa_input-icon-svg_sf" />
            Username:
          </label>
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
        </div>
        */}
        <div className="sa_form-group horizontal_sf">
          <label className="sa_email-label_sf">
            <img src="/src/assets/mail.svg" alt="Mail Icon" className="sa_input-icon-svg_sf" />
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
        <div className="sa_form-group horizontal_sf">
          <label className="sa_input-label_sf">
            <img src="/src/assets/lock.svg" alt="Password Icon" className="sa_input-icon-svg_sf" />
            Password:
          </label>
          <div className="sa_password-input-container_sf">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              maxLength={9}
            />
            <button type="button" className="sa_password-toggle_sf" onClick={togglePasswordVisibility}>
              <img
                src={showPassword ? showIcon : hideIcon}
                alt={showPassword ? "Hide password" : "Show password"}
                className="sa_password-icon_sf"
              />
            </button>
          </div>
        </div>
        <div className="sa_form-group horizontal_sf">
          {/* Removed label for Confirm Password */}
          <div className="sa_password-input-container_sf">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              maxLength={9}
              placeholder="Confirm Password" /* Added placeholder */
            />
            <button type="button" className="sa_password-toggle_sf" onClick={toggleConfirmPasswordVisibility}>
              <img
                src={showConfirmPassword ? showIcon : hideIcon}
                alt={showConfirmPassword ? "Hide password" : "Show password"}
                className="sa_password-icon_sf"
              />
            </button>
          </div>
        </div>
        
        <button type="submit" className="sa_login-button_sf">Sign Up</button>
        <div className="sa_signup-link_sf">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="sa_link-button_sf"
              onClick={() => navigate('/SuperAdminlogin')}
            >
              Login
            </button>
          </p>
        </div>
        <div className="sa_powered-by_sf">
          <p>
            Powered by{' '}
            <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" className="sa_input-icon-svg_sf" />
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;

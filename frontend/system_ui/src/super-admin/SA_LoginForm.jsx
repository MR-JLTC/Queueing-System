// SA_LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SA_LoginForm.css'; // Keep this for page-level/background styles
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import bcrypt from 'bcryptjs';
import axios from 'axios';

// Import Material UI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// Import Material UI Icons
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Styled TextField for consistent professional look and improved visibility
const CustomTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#333b4d', // Distinct dark blue-gray for input background
    color: '#e0e0e0', // Lighter text color
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.4)', // Subtle blue border
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    height: '56px', // Explicit height for better consistency and to prevent cutting
    padding: '0 14px', // Adjust padding for inner text
    fontSize: '18px', // Adjusted font size for input text to fit comfortably and be readable
    '&:hover fieldset': {
      borderColor: '#007bff !important', // Blue border on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007bff !important', // Bright blue border on focus
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', // Subtle blue glow
    },
    '& fieldset': {
      borderColor: 'transparent', // Hide default border
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(224, 224, 224, 0.9)', // Label color, slightly transparent
    fontSize: '18px', // Increased font size for labels (unshrunk)
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    // Adjusted label position to ensure it's not cut off with increased font size and height
    transform: 'translate(14px, 18px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)', // Adjusted shrunk label position
      fontSize: '15px', // Smaller font size when shrunk
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#007bff', // Label color when focused
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#a0a0a0', // Placeholder color for better visibility
    opacity: 1,
  },
  // Style for the helper text (e.g., for pattern validation)
  '& .MuiFormHelperText-root': {
    color: '#ffc107', // A warning color for hints
    fontSize: '14px', // Adjusted font size for helper text (less prominent than input text)
    marginLeft: '14px', // Align with input padding
  },
}));


const LoginForm = () => { // Component name is LoginForm as per your file
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', // Removed username from state
    password: ''
  });
  const [popup, setPopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    // Check if already logged in as Super Admin
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const roleId = localStorage.getItem("roleId");

    if (isLoggedIn && roleId === "1") { // Only redirect if already logged in as Super Admin
      navigate('/SuperAdminDashboard', { replace: true });
    }
  }, [navigate]);

  // Helper function to validate email format
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Apply max length directly to password input value
    if (name === 'password') {
      if (value.length > 9) { // Strict max length for password
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email and password presence
    if (!formData.email || !formData.password) {
      showPopupMessage(setPopup, "error", "Please enter both email and password.");
      return;
    }

    // Final email validation before submission
    if (!validateEmail(formData.email)) {
      showPopupMessage(setPopup, "error", "Please enter a valid email address.");
      setEmailError(true); // Ensure error state is set for visual feedback
      return;
    }

    // Password length validation for submission
    if (formData.password.length < 6 || formData.password.length > 9) { // Min 6, Max 9
      showPopupMessage(setPopup, "error", "Password must be between 6 and 9 characters long.");
      return;
    }

    try {
      // Fetch users from the backend
      // We fetch all users to find by email, as username is no longer an input.
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;

      if (!users || users.length === 0) {
        showPopupMessage(setPopup, "error", "No users found in the system. Please sign up first.");
        return;
      }

      // Find user by email (case-insensitive)
      const user = users.find(u =>
        u.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (user) {
        // Compare provided password with hashed password from database
        const isPasswordValid = await bcrypt.compare(formData.password, user.passwordHash);

        if (isPasswordValid) {
          if (user.roleId === 1) { // Check if the user is a Super Admin (roleId 1)
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userId", user.userId);
            localStorage.setItem("roleId", user.roleId);
            // localStorage.setItem("username", user.username); // REMOVED: Store generated username
            localStorage.setItem("fullName", user.fullName);
            localStorage.setItem("branchId", user.branchId !== null && user.branchId !== undefined ? user.branchId.toString() : '');
            showPopupMessage(setPopup, "success", "Login successful!");
            setTimeout(() => navigate('/SuperAdminDashboard', { replace: true }), 700);
          } else {
            localStorage.clear();
            showPopupMessage(setPopup, "error", "Account is Not a SuperAdmin.");
          }
        } else {
          showPopupMessage(setPopup, "error", "Invalid credentials. Please try again.");
        }
      } else {
        showPopupMessage(setPopup, "error", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = "An unexpected error occurred. Please try again later.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "Login failed: User not found. Please check your email.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = `Login failed: ${error.response.data.message}`;
          } else {
            errorMessage = `Login failed: Server responded with status ${error.response.status}.`;
          }
        } else if (error.request) {
          errorMessage = "Login failed: No response from server. Please ensure the backend is running.";
        } else {
          errorMessage = `Login failed: ${error.message}`;
        }
      } else {
        errorMessage = `Login failed: ${error.message}`;
      }
      showPopupMessage(setPopup, "error", errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="sa_login-page">
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="sa_header-section2">
        <div className="sa_logo-section">
          <div className="sa_logo">
            <img src="/src/assets/sys_logo.png" alt="System Logo" />
          </div>
          <h1 className="sa_inter-font">
            <span style={{ color: 'white' }}>Super Admin Log In Portal</span>
          </h1>
          <p className="text-gray-300 font-light">Please log in to your account using the form below.</p>
        </div>
      </div>
      <form className="sa_login-container" onSubmit={handleSubmit}>
        {/* Email Input Field */}
        <div className="sa_form-group horizontal">
          <CustomTextField
            fullWidth
            name="email"
            type="email"
            placeholder='Enter Email'
            value={formData.email}
            onChange={handleInputChange}
            error={emailError}
            helperText={emailError ? "Please enter a valid email address." : "e.g., user@example.com"}
            inputProps={{ autocomplete: 'off' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: '2px' }}>
                  <MailOutline sx={{ color: '#a0a0a0', fontSize: '24px' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </div>

        {/* Password Input Field */}
        <div className="sa_form-group horizontal">
          <CustomTextField
            fullWidth
            placeholder='Enter Password'
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            required
            inputProps={{ maxLength: 9, autocomplete: 'new-password' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: '2px' }}>
                  <LockOutlined sx={{ color: '#a0a0a0', fontSize: '24px' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                    sx={{ color: 'white', '&:hover': { color: 'white' } }}
                  >
                    {showPassword ? <VisibilityOff sx={{ fontSize: '24px' }} /> : <Visibility sx={{ fontSize: '24px' }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </div>

        {/* Forgot Password Link */}
        <div className="sa_forgot-password-link w-full max-w-md flex justify-end">
          <Button
            onClick={() => navigate('/SuperAdminForgot')}
            sx={{
              color: '#8ab4f8',
              textTransform: 'none',
              '&:hover': {
                color: '#a8c7fa',
                textDecoration: 'underline',
                backgroundColor: 'transparent'
              },
              padding: 0,
              minWidth: 'auto',
              fontSize: '16px'
            }}
          >
            Forgot password?
          </Button>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="contained"
          sx={{
            width: '80%',
            maxWidth: '300px',
            paddingY: '16px',
            borderRadius: '28px',
            backgroundColor: '#3498db',
            color: 'white',
            fontWeight: 600,
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)',
            transition: 'background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease',
            '&:hover': {
              backgroundColor: '#2980b9',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(52, 152, 219, 0.5)',
            },
            '&:active': {
              backgroundColor: '#21618c',
              transform: 'translateY(0)',
              boxShadow: '0 2px 10px rgba(52, 152, 219, 0.3)',
            },
            mt: 1,
            mb: 2,
          }}
        >
          Login
        </Button>

        {/* Signup Link */}
        <div className="sa_signup-link text-gray-300 text-sm mt-4 flex items-center justify-center gap-1">
          <p className="m-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', lineHeight: '1' }}>Don't have an account?</p>
          <Button
            onClick={() => navigate('/SuperAdminSignup')}
            sx={{
              color: '#8ab4f8',
              textTransform: 'none',
              '&:hover': {
                color: '#a8c7fa',
                textDecoration: 'underline',
                backgroundColor: 'transparent'
              },
              padding: 0,
              minWidth: 'auto',
              fontSize: '16px',
              paddingLeft: '4px',
              lineHeight: '1.2',
            }}
          >
            Signup
          </Button>
        </div>

        {/* Powered By Section */}
        <div className="sa_powered-by text-gray-400 text-xs mt-auto pt-4 flex items-center justify-center gap-2">
          <p className="m-0" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Powered by</p>
          <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" className="w-5 h-auto opacity-70" />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

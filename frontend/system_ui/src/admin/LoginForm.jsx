import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios'; // Import axios for API calls
import bcrypt from 'bcryptjs'; // Import bcryptjs for password comparison

// Import Material UI components for consistency
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
    fontSize: '19px', // Adjusted font size for input text to fit comfortably and be readable
    '&:hover fieldset': {
      borderColor: '#007bff !important', // Blue border on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007bff !important', // Bright blue border on focus
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', // Subtle blue glow
    },
    '& fieldset': {
      border: 'none', // Hide default border
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
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none', // Remove default border
  },
  '& .MuiInputAdornment-root': {
    color: '#8ab4f8', // Icon color
  },
  '& .MuiFormHelperText-root': {
    color: '#ffc107', // Warning color for hints
    fontSize: '14px', // Adjusted font size for helper text (less prominent than input text)
    marginLeft: '14px', // Align with input padding
  },
}));


const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [popup, setPopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    // Check if already logged in as Admin (roleId 2)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const roleId = localStorage.getItem("roleId");

    if (isLoggedIn && roleId === "2") {
      console.log("[LoginForm] User is already logged in as Admin. Redirecting to Admin Dashboard.");
      navigate('/AdminDashboard', { replace: true });
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

    console.log("[LoginForm] Attempting login...");
    console.log("[LoginForm] Email entered:", formData.email);
    // console.log("[LoginForm] Password entered (plain):", formData.password); // For debugging, REMOVE IN PRODUCTION!

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
    if (formData.password.length < 8 || formData.password.length > 9) {
      showPopupMessage(setPopup, "error", "Password must be between 8 and 9 characters long.");
      return;
    }

    try {
      console.log(`[LoginForm] Fetching ALL users from backend: ${API_BASE_URL}/users`);
      const response = await axios.get(`${API_BASE_URL}/users`); // Fetch all users
      const allUsers = response.data; // This will be an array of user objects

      console.log("[LoginForm] All users received from backend:", allUsers);

      // Find the specific user by email from the fetched list
      const userData = allUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (!userData) {
        console.log("[LoginForm] User not found with provided email.");
        showPopupMessage(setPopup, "error", "Invalid credentials.");
        return;
      }

      console.log("[LoginForm] Found user data:", userData);
      console.log("[LoginForm] Hashed password from backend:", userData.passwordHash);
      const isPasswordValid = await bcrypt.compare(formData.password, userData.passwordHash);
      console.log("[LoginForm] bcrypt.compare result (isPasswordValid):", isPasswordValid);

      if (isPasswordValid) {
        console.log("[LoginForm] Password is valid. Checking role...");
        // Check if the user is an Admin (roleId 2)
        if (userData.roleId === 2) { // Assuming roleId 2 is for Admin
          console.log("[LoginForm] User is an Admin. Logging in.");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("userId", userData.userId);
          localStorage.setItem("roleId", userData.roleId);
          localStorage.setItem("username", userData.username); // Store username if available
          localStorage.setItem("fullName", userData.fullName);

          // Store branchId if available
          if (userData.branchId !== undefined && userData.branchId !== null) {
            localStorage.setItem("branchId", userData.branchId.toString()); // Ensure it's stored as a string
            console.log("[LoginForm] Stored branchId:", userData.branchId);
          } else {
            localStorage.removeItem("branchId"); // Ensure no old branchId is left if not assigned
            console.warn("[LoginForm] No branchId found for this admin user.");
          }

          showPopupMessage(setPopup, "success", "Login successful!");
          setTimeout(() => navigate('/AdminDashboard', { replace: true }), 700);
        } else {
          // If not an Admin, show error and do NOT log them in or redirect
          console.log(`[LoginForm] User roleId is ${userData.roleId}, not Admin (2).`);
          localStorage.clear(); // Clear any potentially stored items (defensive)
          showPopupMessage(setPopup, "error", "Account is Not an Admin.");
        }
      } else {
        console.log("[LoginForm] Password invalid.");
        showPopupMessage(setPopup, "error", "Invalid credentials.");
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = "An unexpected error occurred. Please try again later.";

      // Detailed error handling for Axios errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with a status code outside of 2xx range
          console.error("[LoginForm] Backend response error:", error.response.status, error.response.data);
          if (error.response.status === 404) { // /users endpoint returning 404 if no users, or if the path is wrong
            errorMessage = "Login failed: User lookup failed. Please check backend setup.";
          } else if (error.response.status === 401) {
            errorMessage = "Invalid credentials.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = `Login failed: ${error.response.data.message}`;
          } else {
            errorMessage = `Login failed: Server responded with status ${error.response.status}.`;
          }
        } else if (error.request) {
          // Request was made but no response was received
          errorMessage = "Login failed: No response from server. Please ensure the backend is running.";
          console.error("[LoginForm] No response from server:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = `Login failed: ${error.message}`;
          console.error("[LoginForm] Axios setup error:", error.message);
        }
      } else {
        // Generic error
        errorMessage = `Login failed: ${error.message}`;
      }
      showPopupMessage(setPopup, "error", errorMessage);
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
            <img src="/src/assets/sys_logo.png" alt="System Logo" />
          </div>
          <h1 className="inter-font">
            <span style={{ color: 'white' }}>Welcome to </span><span style={{ color: '#007bff' }}>QLine</span>
          </h1>
          <p className="text-gray-300 font-light">Please log in to your account using the form below.</p>
        </div>
      </div>
      <form className="login-container" onSubmit={handleSubmit}>
        {/* Email Input Field */}
        <div className="form-group horizontal">
          <CustomTextField
            fullWidth
            name="email"
            type="email"
            placeholder='Enter your email'
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
        <div className="form-group horizontal">
          <CustomTextField
            fullWidth
            placeholder='Enter your password'
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
                    sx={{ color: '#a0a0a0', '&:hover': { color: '#e0e0e0' } }}
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
        <div className="forgot-password-link w-full max-w-md flex justify-end">
          <Button
            onClick={() => navigate('/AdminForgot')}
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

        {/* Signup Link (if applicable for Admin login) */}
        {/* This section is commented out in your original code, keeping it commented.
        <div className="signup-link text-gray-300 text-sm mt-4 flex items-center justify-center gap-1">
          <p className="m-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', lineHeight: '1' }}>Don't have an account?</p>
          <Button
            onClick={() => navigate('/AdminSignup')} // Assuming an AdminSignup route
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
        </div> */}

        {/* Powered By Section */}
        <div className="powered-by text-gray-400 text-xs mt-auto pt-4 flex items-center justify-center gap-2">
          <p className="m-0" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Powered by</p>
          <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" className="w-5 h-auto opacity-70" />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

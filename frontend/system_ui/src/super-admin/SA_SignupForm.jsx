// SA_SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SA_SignupForm.css'; // Keep this for page-level/background styles
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import bcrypt from 'bcryptjs'; // Ensure bcryptjs is imported if used for hashing on frontend (though typically backend)
import axios from 'axios';

// Import Material UI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// Import Material UI Icons
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Styled TextField for consistent professional look and improved visibility
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#333b4d', // Distinct dark blue-gray for input background
    color: '#e0e0e0', // Lighter text color
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.4)', // Subtle blue border
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    height: '56px', // Explicit height for better consistency and to prevent cutting
    padding: '0 14px', // Adjust padding for inner text
    fontSize: '18px', // Adjusted font size for input text to match LoginForm
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
    fontSize: '14px', // Adjusted font size for helper text to match LoginForm
    marginLeft: '14px', // Align with input padding
  },
}));

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [popup, setPopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState(false); // New state for email validation error

  const API_BASE_URL = 'http://localhost:3000';

  // Helper function to validate email format
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time email validation
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
  };

  const generateSuperAdminUsername = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;

      let maxSuperAdminNumber = 0;
      users.forEach(user => {
        const match = user.username.match(/^SuperAdmin_(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSuperAdminNumber) {
            maxSuperAdminNumber = num;
          }
        }
      });
      return `SuperAdmin_${maxSuperAdminNumber + 1}`;
    } catch (error) {
      console.error("Error generating SuperAdmin username:", error);
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : error.message || "Failed to generate username.";
      showPopupMessage(setPopup, "error", `Error: ${errorMessage}`);
      return "SuperAdmin_Fallback";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final email validation before submission
    if (formData.email && !validateEmail(formData.email)) {
      showPopupMessage(setPopup, "error", "Please enter a valid email address.");
      setEmailError(true); // Ensure error state is set for visual feedback
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showPopupMessage(setPopup, "error", "Passwords do not match!");
      return;
    }

    try {
      const generatedUsername = await generateSuperAdminUsername();
      if (generatedUsername === "SuperAdmin_Fallback") {
        return;
      }

      const payload = {
        fullName: formData.fullName,
        username: generatedUsername,
        email: formData.email,
        password: formData.password,
        roleId: 1,
        isActive: true,
        visibilityStatus: "ON_LIVE"
      };

      const response = await axios.post(`${API_BASE_URL}/users`, payload);

      console.log("Signup Success:", response.data);
      showPopupMessage(setPopup, "success", "Account created successfully! Please log in.");

      setTimeout(() => navigate('/SuperAdminlogin'), 1500);

    } catch (error) {
      console.error("Signup Error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 409) {
            errorMessage = error.response.data.message || "User with this email or username already exists.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = `Signup failed: ${error.response.data.message}`;
          } else {
            errorMessage = `Signup failed: Server responded with status ${error.response.status}.`;
          }
        } else if (error.request) {
          errorMessage = "Signup failed: No response from server. Please ensure the backend is running.";
        } else {
          errorMessage = `Signup failed: ${error.message}`;
        }
      } else {
        errorMessage = `Signup failed: ${error.message}`;
      }
      showPopupMessage(setPopup, "error", errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="sa_signup-page_sf">
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="sa_header-section2_sf">
        <div className="sa_logo-section_sf">
          <div className="sa_logo_sf">
            <img src="/src/assets/sys_logo.png" alt="System Logo" />
          </div>
          <h1 className="sa_inter-font_sf">
            <span style={{ color: 'white' }}>Super Admin Sign Up Portal</span>
          </h1>
          <p className="text-gray-300 font-light">Kindly fill up the form to get started.</p>
        </div>
      </div>
      <form className="sa_login-container_sf" onSubmit={handleSubmit}>
        {/* Full Name Input Field */}
        <div className="sa_form-group horizontal_sf">
          <CustomTextField
            fullWidth
            placeholder='Enter your full name'
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            inputProps={{ maxLength: 255, autocomplete: 'off' }} // Added autocomplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: '2px' }}>
                  <AccountCircle sx={{ color: '#a0a0a0', fontSize: '24px' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </div>

        {/* Email Input Field */}
        <div className="sa_form-group horizontal_sf">
          <CustomTextField
            fullWidth
            placeholder='Enter your email'
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={emailError} // Pass emailError state to 'error' prop
            helperText={emailError ? "Please enter a valid email address." : "e.g., user@example.com"} // Dynamic helper text
            inputProps={{ autocomplete: 'off' }} // Added autocomplete="off"
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
        <div className="sa_form-group horizontal_sf">
          <CustomTextField
            fullWidth
            placeholder='Enter your password'
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            required
            inputProps={{ maxLength: 9, autocomplete: 'new-password' }} // Use 'new-password' for password fields
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

        {/* Confirm Password Input Field */}
        <div className="sa_form-group horizontal_sf">
          <CustomTextField
            fullWidth
            placeholder='Confirm Password'
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            inputProps={{ maxLength: 9, autocomplete: 'new-password' }} // Use 'new-password' for password fields
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: '2px' }}>
                  <LockOutlined sx={{ color: '#a0a0a0', fontSize: '24px' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                    sx={{ color: '#a0a0a0', '&:hover': { color: '#e0e0e0' } }}
                  >
                    {showConfirmPassword ? <VisibilityOff sx={{ fontSize: '24px' }} /> : <Visibility sx={{ fontSize: '24px' }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </div>

        {/* Sign Up Button */}
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
          Sign Up
        </Button>

        {/* Login Link */}
        <div className="sa_signup-link_sf text-gray-300 text-sm mt-4 flex items-center justify-center gap-1">
          <p className="m-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', lineHeight: '1' }}>Already have an account?</p>
          <Button
            onClick={() => navigate('/SuperAdminlogin')}
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
              lineHeight: '1',
            }}
          >
            Login
          </Button>
        </div>

        {/* Powered By Section */}
        <div className="sa_powered-by_sf text-gray-400 text-xs mt-auto pt-4 flex items-center justify-center gap-2">
          <p className="m-0" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Powered by</p>
          <img src="/src/assets/bahandi_logo.png" alt="Bahandi Logo" className="w-5 h-auto opacity-70" />
        </div>
      </form>
    </div>
  );
};

export default SignupForm;

import React, { useState } from "react";
import "./SA_ForgotPassword.css"; // Uses the same CSS for overall layout and form-box
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios'; // Import axios for API calls

// Import Material UI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// Import Material UI Icons
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
  },
  '& .MuiInputBase-input': {
    // Styles for the actual input element
    color: '#e0e0e0', // Text color when typing
    padding: '14px 14px', // Adjust padding for inner text
    height: '28px', // Explicit height to prevent cutting
    fontSize: '18px', // Adjust font size for input text
    '&::placeholder': {
      color: '#a0a0a0', // Placeholder color for better visibility
      opacity: 1,
    },
    // Autofill background color override
    '&:-webkit-autofill': {
      backgroundColor: 'transparent !important',
      backgroundImage: 'none !important',
      '-webkit-box-shadow': '0 0 0 50px #333b4d inset !important', // Force dark background
      '-webkit-text-fill-color': '#e0e0e0 !important', // Force light text color
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '&:-webkit-autofill:focus': {
      backgroundColor: 'transparent !important',
      backgroundImage: 'none !important',
      '-webkit-box-shadow': '0 0 0 50px #333b4d inset !important',
      '-webkit-text-fill-color': '#e0e0e0 !important',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none', // Remove default border as we use border on MuiInputBase-root
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none', // Remove hover border
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none', // Remove focused border
  },
  '& .MuiInputAdornment-root': {
    color: '#a0a0a0', // Icon color
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiInputAdornment-root': {
    color: '#007bff', // Icon color on focus
  },
  // Apply a consistent focus ring/shadow for visual feedback
  '& .MuiOutlinedInput-root.Mui-focused': {
    border: '1px solid #007bff', // Bright blue border on focus
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', // Subtle blue glow
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  // Ensure background color is maintained on focus
  '& .MuiOutlinedInput-root:hover': {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
  },
  // Make sure to remove default padding that might push the icon too far
  '& .MuiInputAdornment-positionStart': {
    marginRight: '8px',
  },
}));


// Modified to accept 'email' as a prop
const ChangePassword = ({ onCancel}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popup, setPopup] = useState(null); // { type, message }
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const email = localStorage.getItem("resetEmail"); // Retrieve email from localStorage
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => { // Made the function asynchronous
    e.preventDefault();
    if (password !== confirmPassword) {
      showPopupMessage(setPopup, "error", "Passwords do not match.");
      return;
    }

    // Ensure email is available from props
    if (!email) {
      showPopupMessage(setPopup, "error", "Email is missing. Please restart the forgot password process.");
      return;
    }

    try {
      // Make API call to your new backend endpoint
      // Replace 'http://localhost:3000' with your actual backend URL if different
      const response = await axios.post('http://localhost:3000/users/reset-password-by-email', {
        email: email, // Pass the email received as a prop
        password: password, // The new password
      });
      // Handle success
      showPopupMessage(setPopup, "success", response.data.message || "Password changed successfully!");     
      setTimeout(() => {
        window.location.href = "/SuperAdminlogin"; // Redirect to login page
      }, 700);

    } catch (error) {
      console.error("Error changing password:", error.response ? error.response.data : error.message);
      // Display error message from backend if available, otherwise a generic one
      const errorMessage = error.response?.data?.message || "Failed to change password. Please try again.";
      showPopupMessage(setPopup, "error", errorMessage);
    }
  };

  return (
    <div className="sa_fullscreen-bg">
      {/* ✅ POPUP */}
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      {/* ✅ HEADER */}
      <div className="sa_header-section">
        <div className="sa_logo-section">
          <div className="sa_logo">
            <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="sa_inter-font">
            <span style={{ color: 'white' }}>Welcome to </span><span style={{ color: 'yellow' }}>QLine</span>
          </h1>
        </div>
      </div>
      {/* ✅ CHANGE PASSWORD FORM */}
      <div className="sa_form-box">
        <h2 className="sa_form-title">Change your password.</h2>
        <form onSubmit={handleSubmit}>
            <CustomTextField
                fullWidth
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                inputProps={{ maxLength: 9 }} // max length for input
                sx={{ mb: 2 }} // Margin bottom
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: '#a0a0a0' }} // Icon color
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
            />
            <CustomTextField
                fullWidth
                variant="outlined"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                inputProps={{ maxLength: 9 }} // max length for input
                sx={{ mb: 2 }} // Margin bottom
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: '#a0a0a0' }} // Icon color
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
            />

            {/* 👇 BUTTONS WRAPPED HERE */}
            <div className="form-buttons">
                <Button
                  type="submit"
                  sx={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '16px 0',
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
                    mb: 1, // Reduced margin bottom slightly
                  }}
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  onClick={onCancel}
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
                  Cancel
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
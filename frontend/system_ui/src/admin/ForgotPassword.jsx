import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import ChangePassword from "./ChangePassword";
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from "axios";

// Import Material UI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton'; // Not strictly needed for email, but good to have if extending
import { styled } from '@mui/material/styles';

// Import Material UI Icons
import MailOutline from '@mui/icons-material/MailOutline';

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


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [popup, setPopup] = useState(null);

  const API_BASE_URL = "http://localhost:3000"; // IMPORTANT: Update this to your actual backend API URL
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      showPopupMessage(setPopup, "warning", "Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      showPopupMessage(setPopup, "error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/users/check-email`, { email });
      if (response.data.exists) {
        showPopupMessage(setPopup, "success", "Email confirmed. Proceeding to password change.");
        localStorage.setItem("resetEmail", email); // Store email for ChangePassword component
        setTimeout(() => setStep(2), 700);
      } else {
        showPopupMessage(setPopup, "error", "Email not registered. Please check your email or contact support.");
      }
    } catch (error) {
      console.error("Error checking email existence:", error);
      if (error.response && error.response.data && error.response.data.message) {
        showPopupMessage(setPopup, "error", `Error: ${error.response.data.message}`);
      } else {
        showPopupMessage(setPopup, "error", "An error occurred while confirming your email. Please try again.");
      }
    }
  };

  if (step === 2) return <ChangePassword onCancel={() => setStep(1)} />;

  return (
    <div className="fullscreen-bg">
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="header-section_p">
        <div className="logo-section_p">
          <div className="logo_p">
            <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="inter-font">
            <span style={{ color: 'white' }}>Welcome to </span>
            <span style={{ color: 'yellow' }}>QLine</span>
          </h1>
        </div>
      </div>
      <div className="verification-box">
        <div className="form-group">
          {/* Replaced native input with CustomTextField */}
          <CustomTextField
            fullWidth
            variant="outlined"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }} // Margin bottom for spacing
          />
        </div>
        <div className="info-message">
          <img src="/src/assets/checked.png" alt="Check" className="check-icon" />
          <span>Please enter your registered email address to reset your password</span>
        </div>
        {/* Replaced native button with Material-UI Button */}
        <Button
          onClick={handleEmailSubmit}
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
            mt: 1, // Margin top
            mb: 2, // Margin bottom
          }}
        >
          Confirm
        </Button>
        {/* Replaced native button with Material-UI Button for "Back to Login" */}
        <Button
          onClick={() => navigate("/Adminlogin")}
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
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
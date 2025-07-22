// src/components/AddAdminForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
// Removed: import bcrypt from 'bcryptjs'; // No longer needed for client-side hashing

// Styled TextField for consistent professional look
const CustomTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#1f1f1f', // Slightly darker input background for modals
    color: '#e0e0e0', // Lighter text color
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.1)', // More subtle border for modal inputs
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    height: '56px', // Explicit height for better consistency
    padding: '0 14px', // Adjust padding for inner text
    fontSize: '18px',
    '&:hover': {
      borderColor: 'rgba(0, 123, 255, 0.3)',
    },
    '&.Mui-focused': {
      borderColor: '#007bff', // Blue border on focus
      boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.2)', // Blue glow on focus
    },
    '& input': {
      '&::placeholder': {
        color: '#a0a0a0', // Placeholder color
        opacity: 1,
      },
      padding: '18px 0 10px 0', // Adjust vertical padding for input text
    },
  },
  '& .MuiInputLabel-root': {
    color: '#8ab4f8', // Label color
    fontSize: '18px',
    transform: 'translate(14px, 18px) scale(1)', // Initial position
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)', // Shrunk position
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#007bff', // Focused label color
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none', // Remove default border
  },
  '& .MuiInputAdornment-root': {
    color: '#8ab4f8', // Icon color
  },
  '& .MuiFormHelperText-root': {
    color: '#ffc107', // Warning color for hints
    fontSize: '14px',
    marginLeft: '14px',
  },
}));

const API_BASE_URL = 'http://localhost:3000'; // Your backend URL

const AddAdminForm = ({ onClose, onAdminAdded, onAdminOperationError }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Define password constraints
  const MIN_PASSWORD_LENGTH = 8;
  const MAX_PASSWORD_LENGTH = 9; // Strict max password length

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Apply max length directly to input value before setting state
    if (name === 'password' || name === 'confirmPassword') {
      if (value.length > MAX_PASSWORD_LENGTH) {
        // Do not update state if value exceeds max length
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Client-side username generation (Admin_X)
  const generateAdminUsername = async () => {
    try {
      // Fetch all users to determine the next available Admin_X number
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;

      let maxAdminNumber = 0;
      users.forEach(user => {
        const match = user.username.match(/^Admin_(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxAdminNumber) {
            maxAdminNumber = num;
          }
        }
      });
      return `Admin_${maxAdminNumber + 1}`;
    } catch (error) {
      console.error("Error generating Admin username:", error);
      onAdminOperationError("Failed to generate username. Please try again.");
      return null; // Indicate failure
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      onAdminOperationError("All fields are required.");
      return;
    }

    if (!validateEmail(formData.email)) {
      onAdminOperationError("Please enter a valid email address.");
      setEmailError(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      onAdminOperationError("Passwords do not match!");
      return;
    }

    // Updated: Password length validation for submission
    if (formData.password.length < MIN_PASSWORD_LENGTH || formData.password.length > MAX_PASSWORD_LENGTH) {
      onAdminOperationError(`Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters long.`);
      return;
    }

    try {
      const generatedUsername = await generateAdminUsername();
      if (!generatedUsername) {
        return; // Stop if username generation failed
      }

      const payload = {
        fullName: formData.fullName,
        username: generatedUsername,
        email: formData.email,
        password: formData.password, // Send plain password
        roleId: 2, // Explicitly set roleId to 2 for Admin
        isActive: true, // New admins are active by default
        visibilityStatus: "ON_LIVE" // Default visibility status
      };

      const response = await axios.post(`${API_BASE_URL}/users`, payload);

      if (response.status === 201 || response.status === 200) {
        onAdminAdded("Admin added successfully!"); // Call success handler with message
      } else {
        onAdminOperationError(response.data?.message || "Failed to add admin.");
      }

    } catch (error) {
      console.error("Add Admin Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while adding admin.";
      onAdminOperationError(errorMessage);
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="add-admin-modal">
        <Box className="modal-header">
          <Typography variant="h6">Add Admin</Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CustomTextField
            placeholder='Enter full name'
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Enter email address'
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
            error={emailError}
            helperText={emailError ? "Please enter a valid email address." : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline />
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Enter password'
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            required
            // Updated helperText for password length
            helperText={
              formData.password && (formData.password.length < MIN_PASSWORD_LENGTH || formData.password.length > MAX_PASSWORD_LENGTH)
                ? `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters.`
                : ""
            }
            InputProps={{
              maxLength: MAX_PASSWORD_LENGTH, // <--- Strict max length applied here
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Confirm password'
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
            required
            error={formData.confirmPassword && formData.password !== formData.confirmPassword}
            helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match." : ""}
            InputProps={{
              maxLength: MAX_PASSWORD_LENGTH, // <--- Strict max length applied here
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#007bff',
              color: 'white',
              py: 1.5,
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)',
              '&:hover': {
                backgroundColor: '#0056b3',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0, 123, 255, 0.5)',
              },
              '&:active': {
                backgroundColor: '#21618c',
                transform: 'translateY(0)',
                boxShadow: '0 2px 10px rgba(52, 152, 219, 0.3)',
              },
              mt: 2,
            }}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAdminForm;

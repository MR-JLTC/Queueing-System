// src/admin/popup-forms/AddStaffForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  styled,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

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
    '&:hover fieldset': {
      borderColor: 'rgba(0, 123, 255, 0.3) !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007bff !important',
      boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.2) !important',
    },
    '& fieldset': {
      border: 'none', // Remove default border
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(224, 224, 224, 0.9)', // Label color
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transform: 'translate(14px, 18px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
      fontSize: '15px',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
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

const API_BASE_URL = 'http://localhost:3000';

const AddStaffForm = ({ onClose, onStaffAdded, onStaffOperationError, setPopup }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being typed into
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full Name is required.';
      isValid = false;
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      tempErrors.email = 'Invalid email format.';
      isValid = false;
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 8 || formData.password.length > 9) {
      tempErrors.password = 'Password must be 8-9 characters long.';
      isValid = false;
    }
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Confirm Password is required.';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setPopup({ type: 'error', message: 'Please correct the errors in the form.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const adminBranchId = localStorage.getItem("branchId");
      if (!adminBranchId || adminBranchId === 'null' || adminBranchId === 'undefined') {
        onStaffOperationError("Admin's branch ID not found. Cannot add staff.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        roleId: 3, // Assuming roleId 3 is for Staff
        branchId: parseInt(adminBranchId), // Assign to the admin's branch
        isActive: true, // Default new staff to active
        visibilityStatus: 'ON_LIVE', // Default new staff to ON_LIVE
      };

      await axios.post(`${API_BASE_URL}/users`, payload);
      onStaffAdded('Staff added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding staff:', error);
      let errorMessage = 'Failed to add staff.';
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      onStaffOperationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box className="modal-overlay">
      <Box className="add-admin-modal" sx={{ maxWidth: '500px', width: '90%', p: 3, borderRadius: '12px', bgcolor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(100, 110, 130, 0.2)' }}>
        <Box className="modal-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 1, borderBottom: '1px solid rgba(100, 110, 130, 0.1)' }}>
          <Typography variant="h6" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
            Add New Staff
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountCircle sx={{ mr: 1 }} /> Full Name
              </Box>
            }
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ mb: 2 }}
            error={!!errors.fullName}
            helperText={errors.fullName}
            InputLabelProps={{ shrink: true }}
          />

          {/* Email */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <MailOutline sx={{ mr: 1 }} /> Email
              </Box>
            }
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ mb: 2 }}
            error={!!errors.email}
            helperText={errors.email}
            InputLabelProps={{ shrink: true }}
          />

          {/* Password */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <LockOutlined sx={{ mr: 1 }} /> Password
              </Box>
            }
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ mb: 2 }}
            error={!!errors.password}
            helperText={errors.password}
            inputProps={{ maxLength: 9 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ color: '#a0a0a0' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm Password */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <LockOutlined sx={{ mr: 1 }} /> Confirm Password
              </Box>
            }
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ mb: 3 }}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            inputProps={{ maxLength: 9 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility} edge="end" sx={{ color: '#a0a0a0' }}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
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
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Add Staff'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AddStaffForm;

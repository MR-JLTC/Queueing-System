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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business'; // For branch icon
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

const AddAdminForm = ({ onClose, onAdminAdded, onAdminOperationError, branches, loadingBranches }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    branchId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.fullName) { newErrors.fullName = "Full Name is required."; isValid = false; }
    if (!formData.email) {
      newErrors.email = "Email is required."; isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid."; isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required."; isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters."; isValid = false;
    } else if (formData.password.length > 9) {
      newErrors.password = "Password cannot exceed 9 characters."; isValid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required."; isValid = false;
    } else if (formData.confirmPassword.length > 9) {
      newErrors.confirmPassword = "Confirm password cannot exceed 9 characters."; isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."; isValid = false;
    }
    if (!formData.branchId) {
      newErrors.branchId = "Branch is required."; isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      onAdminOperationError("Please correct the errors in the form.");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        roleId: 2, // Hardcode roleId for Admin
        branchId: Number(formData.branchId),
        isActive: true,
        visibilityStatus: "ON_LIVE",
      };

      const response = await axios.post(`${API_BASE_URL}/users`, payload);

      if (response.status === 201 || response.status === 200) {
        onAdminAdded("Admin user added successfully!");
      } else {
        onAdminOperationError(response.data?.message || "Failed to add admin user.");
      }

    } catch (error) {
      console.error("Add Admin Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while adding admin user.";
      onAdminOperationError(errorMessage);
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="add-admin-modal">
        <Box className="modal-header">
          <Typography variant="h6">Add New Admin</Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CustomTextField
            placeholder='Enter Full Name'
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.fullName}
            helperText={errors.fullName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Enter Email'
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline />
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Enter Password'
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.password}
            helperText={errors.password}
            inputProps={{ maxLength: 9 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ color: 'white' }}> {/* Added color: 'white' */}
                    {showPassword ? <Visibility /> : < VisibilityOff/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Confirm Password'
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            inputProps={{ maxLength: 9 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility} edge="end" sx={{ color: 'white' }}> {/* Added color: 'white' */}
                    {showConfirmPassword ? <Visibility /> : < VisibilityOff/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Branch Selection Dropdown */}
          <FormControl fullWidth required error={!!errors.branchId} sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1f1f1f',
              borderRadius: '10px',
              border: '1px solid rgba(0, 123, 255, 0.1)',
              color: '#e0e0e0',
              '&.Mui-focused': {
                borderColor: '#007bff',
                boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.2)',
              },
              '& .MuiSelect-icon': {
                color: '#8ab4f8',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#8ab4f8',
              fontSize: '18px',
              transform: 'translate(14px, 18px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#007bff',
            },
            '& .MuiFormHelperText-root': {
              color: '#ffc107',
              fontSize: '14px',
              marginLeft: '14px',
            },
          }}>
            <Select
              id="branch-select"
              name="branchId"
              value={formData.branchId}
              onChange={handleInputChange}
              displayEmpty
               sx={{ fontSize: '19px', height: '56px' }} 
              startAdornment={
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <BusinessIcon sx={{ color: '#8ab4f8' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Select a branch
              </MenuItem>

              {loadingBranches ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading Branches...
                </MenuItem>
              ) : branches.length === 0 ? (
                <MenuItem disabled>No Branches Available</MenuItem>
              ) : (
                branches.map((branch) => (
                  <MenuItem key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.branchId && <Typography sx={{ color: '#ffc107', fontSize: '14px', ml: '14px', mt: '3px' }}>{errors.branchId}</Typography>}
          </FormControl>


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
            Add Admin
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAdminForm;

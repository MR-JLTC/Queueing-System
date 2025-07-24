// src/components/EditAdminForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
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
import LockOutlined from '@mui/icons-material/LockOutlined'; // For password fields
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GroupIcon from '@mui/icons-material/Group'; // For Role icon
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

const EditAdminForm = ({ onClose, userData, onAdminUpdated, onAdminDeleted, onAdminOperationError,  branches, loadingBranches }) => {
  const [formData, setFormData] = useState({
    fullName: userData.name || '',
    email: userData.email || '',
    isActive: userData.status === 'Active',
    branchId: userData.branchId || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      fullName: userData.name || '',
      email: userData.email || '',
      isActive: userData.status === 'Active',
      branchId: userData.branchId || '',
      password: '',
      confirmPassword: '',
    });
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validateForm = (isPasswordChange = false) => {
    let newErrors = {};
    let isValid = true;

    if (!formData.fullName) { newErrors.fullName = "Full Name is required."; isValid = false; }
    if (!formData.email) {
      newErrors.email = "Email is required."; isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid."; isValid = false;
    }
    if (!formData.branchId) {
      newErrors.branchId = "Branch is required."; isValid = false;
    }

    if (isPasswordChange) {
      if (!formData.password) {
        newErrors.password = "New password is required."; isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters."; isValid = false;
      } else if (formData.password.length > 9) {
        newErrors.password = "Password cannot exceed 9 characters."; isValid = false;
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm new password is required."; isValid = false;
      } else if (formData.confirmPassword.length > 9) {
        newErrors.confirmPassword = "Confirm password cannot exceed 9 characters."; isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match."; isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isPasswordChangeAttempt = formData.password.length > 0 || formData.confirmPassword.length > 0;

    if (!validateForm(isPasswordChangeAttempt)) {
      onAdminOperationError("Please correct the errors in the form.");
      return;
    }

    const userIdToUpdate = userData.id;
    if (isNaN(Number(userIdToUpdate))) {
      console.error("[EditAdminForm] Cannot update: Invalid user ID (NaN). UserData:", userData);
      onAdminOperationError("Invalid user ID for update. Please try again.");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        isActive: formData.isActive,
        branchId: Number(formData.branchId),
      };

      if (isPasswordChangeAttempt) {
        payload.password = formData.password;
      }

      const response = await axios.patch(`${API_BASE_URL}/users/${userIdToUpdate}`, payload);

      if (response.status === 200) {
        onAdminUpdated("Admin user updated successfully!");
      } else {
        onAdminOperationError(response.data?.message || "Failed to update admin user.");
      }
    } catch (error) {
      console.error("[EditAdminForm] Update Admin Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred while updating admin user.";
      onAdminOperationError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this admin user? This action cannot be undone.")) {
      const userIdToDelete = userData.id;
      if (isNaN(Number(userIdToDelete))) {
        console.error("[EditAdminForm] Cannot delete: Invalid user ID (NaN). UserData:", userData);
        onAdminOperationError("Invalid user ID for delete. Please try again.");
        return;
      }

      try {
        const response = await axios.delete(`${API_BASE_URL}/users/${userIdToDelete}`);

        if (response.status === 200 || response.status === 204) {
          onAdminDeleted("Admin user deleted successfully!");
        } else {
          onAdminOperationError(response.data?.message || "Failed to delete admin user.");
        }
      } catch (error) {
        console.error("[EditAdminForm] Delete Admin Error:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "An error occurred while deleting admin user.";
        onAdminOperationError(errorMessage);
      }
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="edit-admin-modal">
        <Box className="modal-header">
          <Typography variant="h6">Edit Admin</Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSave} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CustomTextField
            label="User ID (Read-only)"
            name="userId"
            value={userData.id || ''}
            fullWidth
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                '-webkit-text-fill-color': '#a0a0a0',
              },
              '& .MuiInputLabel-root.Mui-disabled': {
                color: 'rgba(224, 224, 224, 0.5)',
              }
            }}
          />
          <CustomTextField
            label="Full Name"
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
          {/* Username field removed */}
          <CustomTextField
            label="Email"
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

          <CustomTextField
            label="New Password (optional)"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
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
            label="Confirm New Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
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
                    {showPassword ? <Visibility /> : < VisibilityOff/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={handleInputChange}
                name="isActive"
                sx={{
                  color: '#8ab4f8',
                  '&.Mui-checked': { color: '#28a745' },
                }}
              />
            }
            label={<Typography sx={{ color: '#e0e0e0' }}>Active User</Typography>}
            sx={{ mt: 1 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
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
                flex: 1,
              }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                backgroundColor: '#dc3545', // Red for Delete
                color: 'white',
                py: 1.5,
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
                '&:hover': {
                  backgroundColor: '#c82333',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(220, 53, 69, 0.5)',
                },
                '&:active': {
                  backgroundColor: '#a71d2a',
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 10px rgba(220, 53, 69, 0.3)',
                },
                flex: 1,
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditAdminForm;

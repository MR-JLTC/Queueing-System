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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined'; // For password fields
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GroupIcon from '@mui/icons-material/Group'; // For Role icon
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

const EditAdminForm = ({ onClose, userData, onAdminUpdated, onAdminDeleted, onAdminOperationError }) => {
  const [formData, setFormData] = useState({
    fullName: userData.name || '',
    email: userData.email || '',
    role: userData.role || '', // Role is read-only
    status: userData.status === 'Active', // Convert 'Active'/'Inactive' to boolean
    newPassword: '', // New field for password change
    confirmNewPassword: '', // New field for password confirmation
  });
  const [emailError, setEmailError] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Define password constraints
  const MIN_PASSWORD_LENGTH = 8;
  const MAX_PASSWORD_LENGTH = 9; // Strict max password length

  useEffect(() => {
    console.log("[EditAdminForm] userData received:", userData); // DEBUG: Log userData prop
    setFormData({
      fullName: userData.name || '',
      email: userData.email || '',
      role: userData.role || '',
      status: userData.status === 'Active',
      newPassword: '', // Reset password fields on user change
      confirmNewPassword: '', // Reset password fields on user change
    });
  }, [userData]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    // Apply max length directly to input value before setting state
    if (name === 'newPassword' || name === 'confirmNewPassword') {
      if (value.length > MAX_PASSWORD_LENGTH) {
        // Do not update state if value exceeds max length
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      onAdminOperationError("Name and Email are required.");
      return;
    }

    if (!validateEmail(formData.email)) {
      onAdminOperationError("Please enter a valid email address.");
      setEmailError(true);
      return;
    }

    // Validate new password fields ONLY if they are being changed
    if (formData.newPassword || formData.confirmNewPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        onAdminOperationError("New passwords do not match!");
        return;
      }
      if (formData.newPassword.length < MIN_PASSWORD_LENGTH || formData.newPassword.length > MAX_PASSWORD_LENGTH) {
        onAdminOperationError(`New password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long.`);
        return;
      }
    }

    // Ensure userData.id is a valid number before sending
    const userIdToUpdate = Number(userData.id);
    if (isNaN(userIdToUpdate)) {
      console.error("[EditAdminForm] Cannot update: Invalid user ID (NaN). UserData:", userData);
      onAdminOperationError("Invalid user ID for update. Please try again.");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        isActive: formData.status, // <--- This is the boolean value
      };

      // Add password to payload ONLY if it's provided
      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      console.log(`[EditAdminForm] Sending PATCH request for user ID: ${userIdToUpdate}`);
      console.log(`[EditAdminForm] Payload being sent:`, payload);
      console.log(`[EditAdminForm] Type of isActive in payload:`, typeof payload.isActive, `Value:`, payload.isActive); // <--- CRITICAL DEBUG LOG

      const response = await axios.patch(`${API_BASE_URL}/users/${userIdToUpdate}`, payload);

      if (response.status === 200) {
        onAdminUpdated("Admin updated successfully!"); // Call success handler
      } else {
        onAdminOperationError(response.data?.message || "Failed to update admin.");
      }
    } catch (error) {
      console.error("[EditAdminForm] Update Admin Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred while updating admin.";
      onAdminOperationError(errorMessage);
    }
  };

  const handleDelete = async () => {
    // Using a simple window.confirm for now, consider a custom modal for better UX
    if (window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
      // Ensure userData.id is a valid number before sending
      const userIdToDelete = Number(userData.id);
      if (isNaN(userIdToDelete)) {
        console.error("[EditAdminForm] Cannot delete: Invalid user ID (NaN). UserData:", userData);
        onAdminOperationError("Invalid user ID for delete. Please try again.");
        return;
      }

      try {
        console.log(`[EditAdminForm] Attempting to DELETE user ID: ${userIdToDelete}`);
        const response = await axios.delete(`${API_BASE_URL}/users/${userIdToDelete}`);

        if (response.status === 200 || response.status === 204) { // 204 No Content is common for successful DELETE
          onAdminDeleted("Admin deleted successfully!"); // Call success handler
        } else {
          onAdminOperationError(response.data?.message || "Failed to delete admin.");
        }
      } catch (error) {
        console.error("[EditAdminForm] Delete Admin Error:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "An error occurred while deleting admin.";
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
            placeholder='Enter email'
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
            placeholder='Role (Read-only)'
            name="role"
            value={formData.role}
            fullWidth
            InputProps={{
              readOnly: true, // Role is read-only as per image
              startAdornment: (
                <InputAdornment position="start">
                  <GroupIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                '-webkit-text-fill-color': '#a0a0a0', // Keep text color for disabled input
              },
              '& .MuiInputLabel-root.Mui-disabled': {
                color: 'rgba(224, 224, 224, 0.5)', // Dim label for disabled input
              }
            }}
          />

          <Typography variant="subtitle1" sx={{ color: '#e0e0e0', mt: 2, mb: 1, textAlign: 'center' }}>
            Change Password (Optional)
          </Typography>
          <CustomTextField
            placeholder='Enter new password'
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleInputChange}
            fullWidth
            helperText={
              formData.newPassword && (formData.newPassword.length < MIN_PASSWORD_LENGTH || formData.newPassword.length > MAX_PASSWORD_LENGTH)
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
                  <IconButton onClick={toggleNewPasswordVisibility} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Confirm new password'
            name="confirmNewPassword"
            type={showConfirmNewPassword ? 'text' : 'password'}
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
            fullWidth
            error={formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword}
            helperText={formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword ? "Passwords do not match." : ""}
            InputProps={{
              maxLength: MAX_PASSWORD_LENGTH, // <--- Strict max length applied here
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmNewPasswordVisibility} edge="end">
                    {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="subtitle1" sx={{ color: '#e0e0e0', mt: 2, mb: 1, textAlign: 'center' }}>
            Status
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.status}
                  onChange={handleInputChange}
                  name="status"
                  sx={{
                    color: '#8ab4f8',
                    '&.Mui-checked': { color: '#28a745' }, // Green for active
                  }}
                />
              }
              label={<Typography sx={{ color: '#e0e0e0' }}>Active</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!formData.status} // Inactive is opposite of active
                  onChange={(e) => setFormData(prev => ({ ...prev, status: !e.target.checked }))}
                  name="status"
                  sx={{
                    color: '#8ab4f8',
                    '&.Mui-checked': { color: '#dc3545' }, // Red for inactive
                  }}
                />
              }
              label={<Typography sx={{ color: '#e0e0e0' }}>Inactive</Typography>}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              type="submit" // This button will trigger handleSave
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
                backgroundColor: '#6c757d', // Gray for Delete
                color: 'white',
                py: 1.5,
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(108, 117, 125, 0.4)',
                '&:hover': {
                  backgroundColor: '#5a6268',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(108, 117, 125, 0.5)',
                },
                '&:active': {
                  backgroundColor: '#4e545a',
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 10px rgba(108, 117, 125, 0.3)',
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

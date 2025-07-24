// src/admin/popup-forms/EditStaffForm.jsx
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
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person'; // For Role/Staff icon
import BusinessIcon from '@mui/icons-material/Business'; // For Branch icon
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

const EditStaffForm = ({ onClose, userData, onStaffUpdated, onStaffDeleted, onStaffOperationError, setPopup }) => {
  const [formData, setFormData] = useState({
    fullName: userData.fullName || '',
    email: userData.email || '',
    isActive: userData.isActive,
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    // Update form data if userData prop changes (e.g., when editing a different user)
    setFormData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      isActive: userData.isActive,
      newPassword: '',
      confirmNewPassword: '',
    });
    setErrors({});
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

    if (formData.newPassword) {
      if (formData.newPassword.length < 8 || formData.newPassword.length > 9) {
        tempErrors.newPassword = 'Password must be 8-9 characters long.';
        isValid = false;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        tempErrors.confirmNewPassword = 'Passwords do not match.';
        isValid = false;
      }
    } else if (formData.confirmNewPassword) { // If confirm password is typed but new password isn't
      tempErrors.newPassword = 'Please enter a new password.';
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
      const updatePayload = {
        fullName: formData.fullName,
        email: formData.email,
        isActive: formData.isActive,
        // Only include password if it's being changed
        ...(formData.newPassword && { password: formData.newPassword }),
      };

      await axios.patch(`${API_BASE_URL}/users/${userData.userId}`, updatePayload);
      onStaffUpdated('Staff updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating staff:', error);
      let errorMessage = 'Failed to update staff.';
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      onStaffOperationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/users/${userData.userId}`);
      onStaffDeleted('Staff deleted successfully!');
      onClose();
    } catch (error) {
      console.error('Error deleting staff:', error);
      let errorMessage = 'Failed to delete staff.';
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      onStaffOperationError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmNewPasswordVisibility = () => setShowConfirmNewPassword(!showConfirmNewPassword);

  return (
    <Box className="modal-overlay">
      <Box className="edit-admin-modal" sx={{ maxWidth: '500px', width: '90%', p: 3, borderRadius: '12px', bgcolor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(100, 110, 130, 0.2)' }}>
        <Box className="modal-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 1, borderBottom: '1px solid rgba(100, 110, 130, 0.1)' }}>
          <Typography variant="h6" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
            Edit Staff: {userData.fullName}
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

          {/* Username (Display Only) */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountCircle sx={{ mr: 1 }} /> Username
              </Box>
            }
            name="username"
            value={userData.username || ''}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Role (Display Only) */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Role
              </Box>
            }
            name="role"
            value={userData.role?.roleName || 'N/A'}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Branch (Display Only) */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} /> Branch
              </Box>
            }
            name="branch"
            value={userData.branch?.branchName || 'N/A'}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
          />

          {/* New Password */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <LockOutlined sx={{ mr: 1 }} /> New Password (Optional)
              </Box>
            }
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ mb: 2 }}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            inputProps={{ maxLength: 9 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleNewPasswordVisibility} edge="end" sx={{ color: '#a0a0a0' }}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm New Password */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <LockOutlined sx={{ mr: 1 }} /> Confirm New Password
              </Box>
            }
            name="confirmNewPassword"
            type={showConfirmNewPassword ? "text" : "password"}
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ mb: 2 }}
            error={!!errors.confirmNewPassword}
            helperText={errors.confirmNewPassword}
            inputProps={{ maxLength: 9 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmNewPasswordVisibility} edge="end" sx={{ color: '#a0a0a0' }}>
                    {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Is Active Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={handleInputChange}
                name="isActive"
                sx={{ color: '#007bff', '&.Mui-checked': { color: '#007bff' } }}
              />
            }
            label={<Typography sx={{ color: '#e0e0e0' }}>Is Active</Typography>}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
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
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </Box>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <Box className="modal-overlay">
            <Box className="logout-modal" sx={{ p: 3, borderRadius: '12px', bgcolor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(100, 110, 130, 0.2)' }}>
              <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 3 }}>
                Are you sure you want to delete this staff member?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={confirmDelete}
                  sx={{
                    backgroundColor: '#dc3545',
                    '&:hover': { backgroundColor: '#c82333' },
                  }}
                  disabled={isSubmitting}
                >
                  Yes, Delete
                </Button>
                <Button
                  variant="contained"
                  onClick={cancelDelete}
                  sx={{
                    backgroundColor: '#6c757d',
                    '&:hover': { backgroundColor: '#5a6268' },
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EditStaffForm;

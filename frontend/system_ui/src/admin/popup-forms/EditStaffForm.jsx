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
  // Removed FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
// Removed MailOutline, LockOutlined, Visibility, VisibilityOff, PersonIcon as they are no longer relevant
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

// CustomFormControl is no longer needed
// const CustomFormControl = styled(FormControl)(() => ({ ... }));

const API_BASE_URL = 'http://localhost:3000';

// Added branches and loadingBranches props
const EditStaffForm = ({ onClose, userData, onStaffUpdated, onStaffDeleted, onStaffOperationError, setPopup, branches, loadingBranches }) => {
  const [formData, setFormData] = useState({
    fullName: userData.fullName || '',
    branchId: userData.branchId || '', // Initialize with staff's current branchId
    isActive: userData.isActive,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState('Loading Branch...');


  useEffect(() => {
    // Update form data if userData prop changes (e.g., when editing a different staff)
    setFormData({
      fullName: userData.fullName || '',
      branchId: userData.branchId || '',
      isActive: userData.isActive,
    });
    setErrors({});
  }, [userData]);

  // Find and set the branch name for display
  useEffect(() => {
    if (formData.branchId && branches.length > 0) {
      const foundBranch = branches.find(b => b.branchId === formData.branchId);
      if (foundBranch) {
        setCurrentBranchName(foundBranch.branchName);
      } else {
        setCurrentBranchName('Branch Not Found');
      }
    } else if (!formData.branchId) {
      setCurrentBranchName('No Branch Assigned');
    }
  }, [formData.branchId, branches]);


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
    // Branch ID is now automatically set, but still ensure it's valid if staff has no branch
    if (!formData.branchId) {
      tempErrors.branchId = 'Staff must be assigned to a branch.';
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
        branchId: formData.branchId, // Keep branchId in payload even if display-only
        isActive: formData.isActive,
      };

      // API call to the /staff endpoint
      await axios.patch(`${API_BASE_URL}/staff/${userData.staffId}`, updatePayload);
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
      // API call to the /staff endpoint
      await axios.delete(`${API_BASE_URL}/staff/${userData.staffId}`);
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

          {/* Branch Display Field (Non-editable) */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} /> Branch
              </Box>
            }
            name="branchNameDisplay" // A dummy name as it's not part of formData directly
            value={loadingBranches ? "Loading Branch..." : currentBranchName}
            variant="outlined"
            sx={{ mb: 3 }}
            InputProps={{
              readOnly: true, // Make it non-editable
            }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.branchId} // Still show error if branchId is missing
            helperText={errors.branchId}
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
              disabled={isSubmitting || !formData.branchId} // Disable if no branchId is set
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

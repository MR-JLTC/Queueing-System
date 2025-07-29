// src/admin/popup-forms/AddWindowAndAssignmentForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton,
  InputAdornment, // Added for icon in text field
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business'; // For Branch icon
import WindowIcon from '@mui/icons-material/Window'; // For Window Number/Name icon
import PersonIcon from '@mui/icons-material/Person'; // For Staff icon
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum'; // Keep this for window creation if needed

const API_BASE_URL = 'http://localhost:3000';

// Styled TextField for consistent professional look
const CustomTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#1f1f1f', // Darker input background for modals
    color: '#e0e0e0', // Lighter text color
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.1)', // Subtle border
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    height: '56px', // Explicit height
    padding: '0 14px', // Adjust padding
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

// Styled FormControl for Select component
const CustomFormControl = styled(FormControl)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#1f1f1f',
    color: '#e0e0e0',
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.1)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    height: '56px',
    padding: '0 14px',
    fontSize: '18px',
    '&:hover fieldset': {
      borderColor: 'rgba(0, 123, 255, 0.3) !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007bff !important',
      boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.2) !important',
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(224, 224, 224, 0.9)',
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
    color: '#8ab4f8',
  },
  '& .MuiSelect-icon': {
    color: '#8ab4f8', // Icon color for dropdown arrow
  },
}));


const AddWindowAndAssignmentForm = ({ onClose, onOperationSuccess, onOperationError, currentAdminBranchId, branches, loadingBranches, staffUsers, loadingStaff }) => {
  const [formData, setFormData] = useState({
    windowNumber: '',
    windowName: '', // New field for window name
    staffId: '', // Optional staff assignment
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState('Loading Branch...');

  // Set initial branch name for display
  useEffect(() => {
    if (currentAdminBranchId && branches.length > 0) {
      const adminBranchId = parseInt(currentAdminBranchId);
      const foundBranch = branches.find(b => b.branchId === adminBranchId);
      if (foundBranch) {
        setCurrentBranchName(foundBranch.branchName);
      } else {
        setCurrentBranchName('Branch Not Found');
      }
    } else if (!currentAdminBranchId) {
      setCurrentBranchName('No Branch Assigned');
    }
  }, [currentAdminBranchId, branches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.windowNumber.toString().trim()) {
      tempErrors.windowNumber = 'Window Number is required.';
      isValid = false;
    } else if (isNaN(formData.windowNumber) || parseInt(formData.windowNumber) <= 0) {
      tempErrors.windowNumber = 'Window Number must be a positive number.';
      isValid = false;
    }

    if (!formData.windowName.trim()) {
      tempErrors.windowName = 'Window Name is required.';
      isValid = false;
    }

    if (!currentAdminBranchId) {
      tempErrors.branch = 'Admin must be assigned to a branch to add windows.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      onOperationError('Please correct the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const windowPayload = {
        windowNumber: parseInt(formData.windowNumber),
        windowName: formData.windowName, // Include windowName
        branchId: parseInt(currentAdminBranchId), // Automatically use admin's branch
        isActive: true,
        visibilityStatus: VisibilityStatus.ON_LIVE,
      };

      // 1. Create Service Window
      const windowResponse = await axios.post(`${API_BASE_URL}/service-windows`, windowPayload);
      const newWindowId = windowResponse.data.windowId;

      // 2. If staff is selected, assign staff to the new window
      if (formData.staffId) {
        const assignmentPayload = {
          staffId: parseInt(formData.staffId),
          windowId: newWindowId,
          status: 'ACTIVE', // Default status for new assignment
          // Removed visibilityStatus from assignmentPayload
        };
        await axios.post(`${API_BASE_URL}/staff-window-assignments`, assignmentPayload);
      }

      onOperationSuccess('Service Window and Staff Assignment (if selected) added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding service window or assignment:', error);
      let errorMessage = 'Failed to add service window or assignment.';
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      onOperationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="modal-content add-window-modal" sx={{ maxWidth: '500px', width: '90%', p: 3, borderRadius: '12px', bgcolor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(100, 110, 130, 0.2)' }}>
        <Box className="modal-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 1, borderBottom: '1px solid rgba(100, 110, 130, 0.1)' }}>
          <Typography variant="h6" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
            Add New Window & Assign Staff
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2 }}>
          {/* Branch Display Field (Non-editable) */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} /> Branch
              </Box>
            }
            name="branchNameDisplay"
            value={loadingBranches ? "Loading Branch..." : currentBranchName}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.branch}
            helperText={errors.branch}
          />

          {/* Window Number */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <WindowIcon sx={{ mr: 1 }} /> Window Number
              </Box>
            }
            name="windowNumber"
            type="number"
            value={formData.windowNumber}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            error={!!errors.windowNumber}
            helperText={errors.windowNumber}
            InputLabelProps={{ shrink: true }}
          />

          {/* Window Name */}
          <CustomTextField
            fullWidth
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <WindowIcon sx={{ mr: 1 }} /> Window Name (e.g., Payment, Loans)
              </Box>
            }
            name="windowName"
            value={formData.windowName}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            error={!!errors.windowName}
            helperText={errors.windowName}
            InputLabelProps={{ shrink: true }}
          />

          {/* Staff Select (Optional) */}
          <CustomFormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="staff-select-label" shrink={true}>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Assign Staff (Optional)
              </Box>
            </InputLabel>
            <Select
              labelId="staff-select-label"
              id="staff-select"
              name="staffId"
              value={formData.staffId}
              onChange={handleInputChange}
              label="Assign Staff (Optional)"
              disabled={loadingStaff}
              displayEmpty // Allows displaying placeholder when value is empty
              renderValue={(selected) => {
                if (selected === '') {
                  return <Typography sx={{ color: 'rgba(224, 224, 224, 0.6)' }}>Select Staff</Typography>;
                }
                const selectedStaff = staffUsers.find(staff => staff.staffId === selected);
                return selectedStaff ? selectedStaff.fullName : '';
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#1f1f1f', // Dark background for dropdown menu
                    color: '#e0e0e0', // Light text color for dropdown items
                    '& .MuiMenuItem-root': {
                      color: '#e0e0e0',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 123, 255, 0.4)',
                      },
                    },
                  },
                },
              }}
            >
              {loadingStaff ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading Staff...
                </MenuItem>
              ) : (
                [<MenuItem key="" value="" disabled>Select Staff</MenuItem>].concat(
                  staffUsers.map((staff) => (
                    <MenuItem key={staff.staffId} value={staff.staffId}>
                      {staff.fullName}
                    </MenuItem>
                  ))
                )
              )}
            </Select>
          </CustomFormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                backgroundColor: '#6c757d',
                '&:hover': { backgroundColor: '#5a6268' },
                color: '#e0e0e0',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !currentAdminBranchId}
              sx={{
                backgroundColor: '#007bff',
                '&:hover': { backgroundColor: '#0056b3' },
                color: '#e0e0e0',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Add Window & Assign'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddWindowAndAssignmentForm;

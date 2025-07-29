// src/admin/popup-forms/EditWindowAssignmentForm.jsx
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
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import WindowIcon from '@mui/icons-material/Window';
import PersonIcon from '@mui/icons-material/Person';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';

const API_BASE_URL = 'http://localhost:3000';

// Styled TextField for consistent professional look
const CustomTextField = styled(TextField)(() => ({
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
  '& .MuiFormHelperText-root': {
    color: '#ffc107',
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
    color: '#8ab4f8',
  },
}));


const EditWindowAssignmentForm = ({ onClose, assignmentData, onOperationSuccess, onOperationError, branches, loadingBranches, staffUsers, loadingStaff }) => {
  // Initialize form data with existing assignment details
  const [formData, setFormData] = useState({
    windowNumber: assignmentData.windowNumber || '',
    windowName: assignmentData.windowName || '',
    isActive: assignmentData.isActive, // This refers to the window's active status
    staffId: assignmentData.staffId || '', // Current assigned staff, can be null/empty
    branchId: assignmentData.branchId || '', // The branch of the window
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState('Loading Branch...');

  useEffect(() => {
    // Update form data if assignmentData prop changes
    setFormData({
      windowNumber: assignmentData.windowNumber || '',
      windowName: assignmentData.windowName || '',
      isActive: assignmentData.isActive,
      staffId: assignmentData.staffId || '',
      branchId: assignmentData.branchId || '',
    });
    setErrors({});
  }, [assignmentData]);

  // Set initial branch name for display
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

    if (!formData.branchId) {
      tempErrors.branch = 'Window must be assigned to a branch.';
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
      // 1. Update Service Window details
      const windowUpdatePayload = {
        windowNumber: parseInt(formData.windowNumber),
        windowName: formData.windowName,
        isActive: formData.isActive,
        branchId: formData.branchId, // Ensure branchId is sent with window update
      };
      await axios.patch(`${API_BASE_URL}/service-windows/${assignmentData.windowId}`, windowUpdatePayload);

      // 2. Handle Staff Assignment update (create new if changed, delete old if unassigned)
      const currentAssignedStaffId = assignmentData.staffId;
      const newAssignedStaffId = formData.staffId;

      if (currentAssignedStaffId !== newAssignedStaffId) {
        // If there was an old assignment, "delete" it (soft delete/release)
        if (assignmentData.assignmentId) { // Only if there's an existing assignment record
          await axios.delete(`${API_BASE_URL}/staff-window-assignments/${assignmentData.assignmentId}`);
        }

        // If a new staff is selected, create a new assignment
        if (newAssignedStaffId) {
          const assignmentPayload = {
            staffId: parseInt(newAssignedStaffId),
            windowId: assignmentData.windowId,
            status: 'ACTIVE',
          };
          await axios.post(`${API_BASE_URL}/staff-window-assignments`, assignmentPayload);
        }
      }

      onOperationSuccess('Window and Assignment updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating service window or assignment:', error);
      let errorMessage = 'Failed to update window or assignment.';
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
      <Box className="modal-content edit-window-modal" sx={{ maxWidth: '500px', width: '90%', p: 3, borderRadius: '12px', bgcolor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(100, 110, 130, 0.2)' }}>
        <Box className="modal-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 1, borderBottom: '1px solid rgba(100, 110, 130, 0.1)' }}>
          <Typography variant="h6" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
            Edit Window: {assignmentData.windowNumber} - {assignmentData.windowName}
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

          {/* Is Active Switch */}
          {/* <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleInputChange}
                name="isActive"
                color="primary"
              />
            }
            label={<Typography sx={{ color: '#e0e0e0' }}>Is Active</Typography>}
            sx={{ mb: 2 }}
          /> */}

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
              displayEmpty
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
                    backgroundColor: '#1f1f1f',
                    color: '#e0e0e0',
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
                [<MenuItem key="" value="">Unassign Staff</MenuItem>].concat( // Option to unassign
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
              disabled={isSubmitting || !formData.branchId}
              sx={{
                backgroundColor: '#007bff',
                '&:hover': { backgroundColor: '#0056b3' },
                color: '#e0e0e0',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Update Window & Assignment'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditWindowAssignmentForm;

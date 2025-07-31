// src/admin/popup-forms/EditWindowForm.jsx
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton'; // Added IconButton import
import CloseIcon from '@mui/icons-material/Close';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum'; // Ensure this path is correct

const API_BASE_URL = 'http://localhost:3000'; // IMPORTANT: Match your backend URL

// Styled TextField for consistent professional look
const CustomTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#333b4d',
    color: '#e0e0e0',
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.4)',
    transition: 'border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      borderColor: 'rgba(0, 123, 255, 0.6)',
    },
    '&.Mui-focused': {
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.3)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#9E9E9E',
    '&.Mui-focused': {
      color: '#007bff',
    },
  },
  '& .MuiInputBase-input': {
    color: '#e0e0e0',
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #333b4d inset',
      WebkitTextFillColor: '#e0e0e0',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
}));

// Styled FormControl for Select components
const CustomFormControl = styled(FormControl)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#333b4d',
    color: '#e0e0e0',
    borderRadius: '10px',
    border: '1px solid rgba(0, 123, 255, 0.4)',
    transition: 'border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      borderColor: 'rgba(0, 123, 255, 0.6)',
    },
    '&.Mui-focused': {
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.3)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#9E9E9E',
    '&.Mui-focused': {
      color: '#007bff',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '& .MuiSelect-icon': {
    color: '#e0e0e0',
  },
}));

const EditWindowForm = ({ onClose, windowData, onWindowUpdated, onWindowDeleted, onWindowOperationError, setPopup, branches, loadingBranches }) => {
  const [formData, setFormData] = useState({
    windowNumber: windowData.windowNumber || '',
    branchId: windowData.branchId || '',
    isActive: windowData.isActive,
    visibilityStatus: windowData.visibilityStatus || VisibilityStatus.ON_LIVE,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure form data is updated if windowData changes (e.g., if re-opened for a different window)
    setFormData({
      windowNumber: windowData.windowNumber || '',
      branchId: windowData.branchId || '',
      isActive: windowData.isActive,
      visibilityStatus: windowData.visibilityStatus || VisibilityStatus.ON_LIVE,
    });
  }, [windowData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        windowNumber: formData.windowNumber,
        branchId: parseInt(formData.branchId),
        isActive: formData.isActive,
        visibilityStatus: formData.visibilityStatus,
      };

      const response = await axios.patch(`${API_BASE_URL}/service-windows/${windowData.windowId}`, payload);
      onWindowUpdated('Window updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update window:', error);
      onWindowOperationError(`Failed to update window: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this window?")) { // Use custom modal instead of window.confirm in production
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/service-windows/${windowData.windowId}`);
        onWindowDeleted('Window deleted successfully!');
        onClose();
      } catch (error) {
        console.error('Failed to delete window:', error);
        onWindowOperationError(`Failed to delete window: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="modal-content edit-window-modal"
        sx={{ 
          maxWidth: '500px', 
          width: '90%', 
          p: 3, 
          borderRadius: '12px', 
          bgcolor: '#1a1a1a', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)', 
          border: '1px solid rgba(100, 110, 130, 0.2)' 
        }}
      >
        <Box className="modal-header">
          <Typography variant="h6" sx={{ color: '#e0e0e0' }}>Edit Service Window</Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2 }}>
          <CustomTextField
            fullWidth
            label="Window Number"
            name="windowNumber"
            value={formData.windowNumber}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />

          <CustomFormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="branch-select-label" sx={{ color: '#9E9E9E' }}>Branch</InputLabel>
            <Select
              labelId="branch-select-label"
              id="branch-select"
              name="branchId"
              value={formData.branchId}
              onChange={handleInputChange}
              label="Branch"
              required
              disabled={loadingBranches}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#333b4d',
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
              {loadingBranches ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading Branches...
                </MenuItem>
              ) : (
                branches.map((branch) => (
                  <MenuItem key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </MenuItem>
                ))
              )}
            </Select>
          </CustomFormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleInputChange}
                name="isActive"
                color="primary"
              />
            }
            label="Is Active"
            sx={{ color: '#e0e0e0', mb: 2 }}
          />

          <CustomFormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="status-select-label" sx={{ color: '#9E9E9E' }}>Visibility Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              name="visibilityStatus"
              value={formData.visibilityStatus}
              onChange={handleInputChange}
              label="Visibility Status"
              required
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#333b4d',
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
              {Object.values(VisibilityStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </CustomFormControl>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={loading}
              sx={{
                backgroundColor: '#dc3545',
                '&:hover': { backgroundColor: '#c82333' },
                color: '#e0e0e0',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                disabled={loading}
                sx={{
                  backgroundColor: '#007bff',
                  '&:hover': { backgroundColor: '#0056b3' },
                  color: '#e0e0e0',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Window'}
            </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditWindowForm;

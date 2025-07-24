// src/admin/popup-forms/AddWindowForm.jsx
import React, { useState} from 'react';
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
    backgroundColor: '#333b4d', // Dark blue-gray for input background
    color: '#e0e0e0', // Lighter text color
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
    color: '#9E9E9E', // Label color
    '&.Mui-focused': {
      color: '#007bff', // Focused label color
    },
  },
  '& .MuiInputBase-input': {
    color: '#e0e0e0', // Ensure text color is light
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #333b4d inset', // Autofill background
      WebkitTextFillColor: '#e0e0e0', // Autofill text color
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent', // Hide default border
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
    color: '#e0e0e0', // Dropdown icon color
  },
}));


const AddWindowForm = ({ onClose, onWindowAdded, onWindowOperationError, branches, loadingBranches }) => {
  const [formData, setFormData] = useState({
    windowNumber: '',
    branchId: '', // Will be selected from dropdown
    isActive: true,
    visibilityStatus: VisibilityStatus.ON_LIVE,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        windowNumber: formData.windowNumber,
        branchId: parseInt(formData.branchId), // Ensure branchId is a number
        isActive: formData.isActive,
        visibilityStatus: formData.visibilityStatus,
      };

      await axios.post(`${API_BASE_URL}/service-windows`, payload);
      onWindowAdded('Window added successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to add window:', error);
      onWindowOperationError(`Failed to add window: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="modal-content add-window-modal">
        <Box className="modal-header">
          <Typography variant="h6" sx={{ color: '#e0e0e0' }}>Add New Service Window</Typography>
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
                    backgroundColor: '#333b4d', // Dark background for dropdown menu
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
              disabled={loading}
              sx={{
                backgroundColor: '#007bff',
                '&:hover': { backgroundColor: '#0056b3' },
                color: '#e0e0e0',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Window'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddWindowForm;

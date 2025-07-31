// src/super-admin/popup-forms/EditBranchForm.jsx
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
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
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

const EditBranchForm = ({ onClose, branchData, onBranchUpdated, onBranchDeleted, onBranchOperationError }) => {
  const [formData, setFormData] = useState({
    branchName: branchData.branchName || '',
    branchLocation: branchData.branchLocation || '',
    contactNumber: branchData.contactNumber || '',
    visibilityStatus: branchData.visibilityStatus === 'ON_LIVE',
  });
  const [contactNumberError, setContactNumberError] = useState(false);

  useEffect(() => {
    setFormData({
      name: branchData.branchName || '',
      location: branchData.branchLocation || '',
      contactNumber: branchData.contactNumber || '',
      visibilityStatus: branchData.visibilityStatus === 'ON_LIVE',
    });
  }, [branchData]);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === 'contactNumber') {
      // Filter out non-digit and non-hyphen characters in real-time
      const filteredValue = value.replace(/[^0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));

      // Set error if the original value contains characters other than digits or hyphens
      if (value && !/^[0-9-]+$/.test(value)) {
        setContactNumberError(true);
      } else {
        setContactNumberError(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.contactNumber) {
      onBranchOperationError("All fields are required.");
      if (!formData.contactNumber) setContactNumberError(true);
      return;
    }

    // Final client-side validation for contact number (ensure it's not empty and only digits/hyphens)
    if (!/^[0-9-]+$/.test(formData.contactNumber)) {
      onBranchOperationError("Contact number must contain only digits and hyphens.");
      setContactNumberError(true);
      return;
    }

    const branchIdToUpdate = branchData.branchId;
    if (isNaN(Number(branchIdToUpdate))) {
      console.error("[EditBranchForm] Cannot update: Invalid branch ID (NaN). BranchData:", branchData);
      onBranchOperationError("Invalid branch ID for update. Please try again.");
      return;
    }

    try {
      const payload = {
        branchName: formData.name,
        branchLocation: formData.location,
        contactNumber: formData.contactNumber,
        visibilityStatus: formData.visibilityStatus ? "ON_LIVE" : "ON_DELETE",
      };

      const response = await axios.patch(`${API_BASE_URL}/branches/${branchIdToUpdate}`, payload);

      if (response.status === 200) {
        onBranchUpdated("Branch updated successfully!");
      } else {
        onBranchOperationError(response.data?.message || "Failed to update branch.");
      }
    } catch (error) {
      console.error("[EditBranchForm] Update Branch Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred while updating branch.";
      onBranchOperationError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this branch? This action cannot be undone.")) {
      const branchIdToDelete = branchData.branchId;
      if (isNaN(Number(branchIdToDelete))) {
        console.error("[EditBranchForm] Cannot delete: Invalid branch ID (NaN). BranchData:", branchData);
        onBranchOperationError("Invalid branch ID for delete. Please try again.");
        return;
      }

      try {
        const response = await axios.delete(`${API_BASE_URL}/branches/${branchIdToDelete}`);

        if (response.status === 200 || response.status === 204) {
          onBranchDeleted("Branch deleted successfully!");
        } else {
          onBranchOperationError(response.data?.message || "Failed to delete branch.");
        }
      } catch (error) {
        console.error("[EditBranchForm] Delete Branch Error:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "An error occurred while deleting branch.";
        onBranchOperationError(errorMessage);
      }
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="edit-admin-modal">
        <Box className="modal-header">
          <Typography variant="h6">Edit Branch</Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSave} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CustomTextField
            label="Branch ID (Read-only)"
            name="branchId"
            value={branchData.branchId || ''}
            fullWidth
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon />
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
            placeholder='Enter Branch Name'
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon />
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Enter Branch Location'
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            placeholder='Enter Contact Number'
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            fullWidth
            required
            type="text" // Keep as text, filtering in onChange
            inputMode="tel" // Suggest telephone keyboard, which includes hyphens
            pattern="[0-9-]*" // HTML5 pattern for browser hint, allowing digits and hyphens
            error={contactNumberError}
            helperText={contactNumberError ? "Contact number must contain only digits and hyphens." : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="subtitle1" sx={{ color: '#e0e0e0', mt: 2, mb: 1, textAlign: 'center' }}>
            Visibility Status
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.visibilityStatus}
                  onChange={handleInputChange}
                  name="visibilityStatus"
                  sx={{
                    color: '#8ab4f8',
                    '&.Mui-checked': { color: '#28a745' }, // Green for ON_LIVE
                  }}
                />
              }
              label={<Typography sx={{ color: '#e0e0e0' }}>ON_LIVE</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!formData.visibilityStatus} // ON_DELETE is opposite of ON_LIVE
                  onChange={(e) => setFormData(prev => ({ ...prev, visibilityStatus: !e.target.checked }))}
                  name="visibilityStatus"
                  sx={{
                    color: '#8ab4f8',
                    '&.Mui-checked': { color: '#dc3545' }, // Red for ON_DELETE
                  }}
                />
              }
              label={<Typography sx={{ color: '#e0e0e0' }}>ON_DELETE</Typography>}
            />
          </Box>

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
              Save
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                backgroundColor: '#8d1d1bff', // Gray for Delete
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

export default EditBranchForm;

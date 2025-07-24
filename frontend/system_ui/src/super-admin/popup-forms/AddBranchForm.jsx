// src/super-admin/popup-forms/AddBranchForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business'; // For branch name
import LocationOnIcon from '@mui/icons-material/LocationOn'; // For location
import PhoneIcon from '@mui/icons-material/Phone'; // Added for contact number
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

const AddBranchForm = ({ onClose, onBranchAdded, onBranchOperationError }) => {
  const [formData, setFormData] = useState({
    branchName: '',
    branchLocation: '',
    contactNumber: '',
  });
  const [contactNumberError, setContactNumberError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check for required fields
    if (!formData.name || !formData.location || !formData.contactNumber) {
      onBranchOperationError("All fields are required.");
      // Set specific error for contactNumber if it's the missing one
      if (!formData.contactNumber) setContactNumberError(true);
      return;
    }

    // Final client-side validation for contact number (ensure it's not empty and only digits/hyphens)
    if (!/^[0-9-]+$/.test(formData.contactNumber)) {
      onBranchOperationError("Contact number must contain only digits and hyphens.");
      setContactNumberError(true);
      return;
    }

    try {
      const payload = {
        branchName: formData.name,
        branchLocation: formData.location,
        contactNumber: formData.contactNumber,
        visibilityStatus: "ON_LIVE",
      };

      const response = await axios.post(`${API_BASE_URL}/branches`, payload);

      if (response.status === 201 || response.status === 200) {
        onBranchAdded("Branch added successfully!");
      } else {
        onBranchOperationError(response.data?.message || "Failed to add branch.");
      }

    } catch (error) {
      console.error("Add Branch Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while adding branch.";
      onBranchOperationError(errorMessage);
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="add-admin-modal">
        <Box className="modal-header">
          <Typography variant="h6">Add New Branch</Typography>
          <IconButton onClick={onClose} sx={{ color: '#e0e0e0' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            Add Branch
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddBranchForm;

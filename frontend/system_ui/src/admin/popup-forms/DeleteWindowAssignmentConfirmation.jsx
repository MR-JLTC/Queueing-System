// src/admin/popup-forms/DeleteWindowAssignmentConfirmation.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const DeleteWindowAssignmentConfirmation = ({ onClose, assignmentData, onOperationSuccess, onOperationError }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First, delete the staff_window_assignment if it exists
      if (assignmentData.assignmentId) {
        await axios.delete(`${API_BASE_URL}/staff-window-assignments/${assignmentData.assignmentId}`);
      }

      // Then, soft delete the service_window itself
      // This will set visibilityStatus to 'ON_DELETE' and isActive to false
      await axios.delete(`${API_BASE_URL}/service-windows/${assignmentData.windowId}`);

      onOperationSuccess('Window and its assignment deleted successfully!');
      onClose();
    } catch (error) {
      console.error('Error deleting window or assignment:', error);
      let errorMessage = 'Failed to delete window or assignment.';
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      onOperationError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box className="modal-overlay">
      <Box className="logout-modal" sx={{ p: 3, borderRadius: '12px', bgcolor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(100, 110, 130, 0.2)' }}>
        <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 3, textAlign: 'center' }}>
          Are you sure you want to delete Window "{assignmentData.windowNumber} - {assignmentData.windowName}" and its current assignment?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              backgroundColor: '#dc3545',
              '&:hover': { backgroundColor: '#c82333' },
            }}
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              backgroundColor: '#6c757d',
              '&:hover': { backgroundColor: '#5a6268' },
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DeleteWindowAssignmentConfirmation;

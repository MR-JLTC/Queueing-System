// SuperAdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  CssBaseline,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button as MuiButton,
  CircularProgress,
  Select, // Added Select for branch filter
  MenuItem, // Added MenuItem for branch filter
  FormControl, // Added FormControl for Select
  InputLabel, // Added InputLabel for Select
  TextField, // Added TextField import
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group'; // For "Manage Users" icon
import BusinessIcon from '@mui/icons-material/Business'; // For "Manage Branches" icon
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard'; // For the new Overall Dashboard
import QueueIcon from '@mui/icons-material/Queue'; // For dashboard summary cards
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoopIcon from '@mui/icons-material/Loop';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event'; // For date pickers
import BarChartIcon from '@mui/icons-material/BarChart'; // For queue history chart
import InputAdornment from '@mui/material/InputAdornment'; // For search/date inputs
import SearchIcon from '@mui/icons-material/Search'; // For search input
import PeopleIcon from '@mui/icons-material/People'; // For Manage Staff
import WindowIcon from '@mui/icons-material/Window'; // For Manage Windows

// Recharts imports for the Pie Chart
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { styled } from '@mui/material/styles'; // For CustomTextField

import './SuperAdminDashboard.css';
import AddAdminForm from './popup-forms/AddAdminForm';
import EditAdminForm from './popup-forms/EditAdminForm';
import AddBranchForm from './popup-forms/AddBranchForm';
import EditBranchForm from './popup-forms/EditBranchForm';
import EditStaffForm from './popup-forms/EditStaffForm'; // Assuming this exists
import EditWindowForm from './popup-forms/EditWindowForm'; // Assuming this exists
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios';

const drawerWidth = 240;
const API_BASE_URL = 'http://localhost:3000'; // Your backend URL

// Styled TextField for search input (reused from Admin Dashboard)
const CustomSearchTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#1f1f1f',
    color: '#e0e0e0',
    borderRadius: '10px',
    height: '56px',
    padding: '0 14px',
    fontSize: '18px',
    border: '1px solid rgba(0, 123, 255, 0.1)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
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
  '& .MuiInputBase-input::placeholder': {
    color: '#a0a0a0',
    opacity: 1,
  },
  '& .MuiInputAdornment-root': {
    color: '#8ab4f8',
  },
  '& .MuiInputLabel-root': {
    color: '#8ab4f8',
    fontSize: '18px',
    transform: 'translate(14px, 18px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#ffc107',
    fontSize: '14px',
    marginLeft: '14px',
  },
}));

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Super Admin Name');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [popup, setPopup] = useState(null);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [currentView, setCurrentView] = useState('overall-dashboard'); // Default to overall dashboard
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // New states for Overall Dashboard
  const [overallDashboardSummary, setOverallDashboardSummary] = useState({
    totalQueued: 0, served: 0, requeues: 0, cancelled: 0
  });
  const [overallQueueHistorySummary, setOverallQueueHistorySummary] = useState({
    totalQueued: 0, pwd: 0, seniorCitizens: 0, standard: 0, cancelled: 0
  });
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(''); // Stores selected branchId for filter
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day', 'week', 'month', 'year'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loadingOverallDashboard, setLoadingOverallDashboard] = useState(true);
  const [overallDashboardError, setOverallDashboardError] = useState(null);

  // NEW: States for Manage Staff
  const [staffUsers, setStaffUsers] = useState([]);
  const [loadingStaffUsers, setLoadingStaffUsers] = useState(true);
  const [selectedStaffFilterBranchId, setSelectedStaffFilterBranchId] = useState('');
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // NEW: States for Manage Windows
  const [serviceWindows, setServiceWindows] = useState([]);
  const [loadingServiceWindows, setLoadingServiceWindows] = useState(true);
  const [selectedWindowFilterBranchId, setSelectedWindowFilterBranchId] = useState('');
  const [showEditWindowModal, setShowEditWindowModal] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState(null);


  // Pie chart colors (consistent with previous design)
  const PIE_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];


  const fetchAdminUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const allUsers = response.data;
      const adminUsers = allUsers.filter(user => user.roleId === 2);
      const formattedUsers = adminUsers.map(user => {
        const parsedId = Number(user.userId);
        if (isNaN(parsedId)) {
          console.error(`[SuperAdminDashboard] Invalid user ID encountered: ${user.userId}. User object:`, user);
          return null;
        }
        return {
          id: parsedId,
          name: user.fullName,
          email: user.email,
          role: 'Admin',
          status: user.isActive ? 'Active' : 'Inactive',
          branchId: user.branchId,
          branchName: user.branch?.branchName || 'N/A',
        };
      }).filter(Boolean);
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error.response?.data || error.message);
      showPopupMessage(setPopup, "error", "Failed to load admin users. Please check backend connection.");
    } finally {
      setLoadingUsers(false);
    }
  }, [setPopup]);

  const fetchBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/branches`);
      console.log("[SuperAdminDashboard] Fetched branches (raw data):", response.data);
      setBranches(response.data);
      console.log("[SuperAdminDashboard] Branches set for table:", response.data);
    } catch (error) {
      console.error("[SuperAdminDashboard] Error fetching branches:", error.response?.data || error.message);
      let errorMessage = "Failed to load branches. ";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage += `Server responded with status ${error.response.status}. Message: ${error.response.data?.message || 'No specific message.'}`;
        } else if (error.request) {
          errorMessage += "No response from server. Is the backend running?";
        } else {
          errorMessage += `Unknown error: ${error.message}`;
        }
      } else {
        errorMessage += `Unknown error: ${error.message}`;
      }
      showPopupMessage(setPopup, "error", errorMessage);
    } finally {
      setLoadingBranches(false);
    }
  }, [setPopup]);

  // NEW: Function to fetch all staff users, optionally filtered by branch
  const fetchStaffUsers = useCallback(async (branchId = '') => {
    setLoadingStaffUsers(true);
    try {
      const url = branchId ? `${API_BASE_URL}/staff?branchId=${branchId}` : `${API_BASE_URL}/staff`;
      console.log(`[Manage Staff] Fetching staff from: ${url}`); // Debug log
      const response = await axios.get(url);
      console.log("[Manage Staff] Received staff data:", response.data); // Debug log
      setStaffUsers(response.data);
    } catch (error) {
      console.error("Error fetching staff users:", error.response?.data || error.message);
      showPopupMessage(setPopup, "error", "Failed to load staff users.");
      setStaffUsers([]);
    } finally {
      setLoadingStaffUsers(false);
    }
  }, [setPopup]);

  // NEW: Function to fetch all service windows, optionally filtered by branch
  const fetchServiceWindows = useCallback(async (branchId = '') => {
    setLoadingServiceWindows(true);
    try {
      const url = branchId ? `${API_BASE_URL}/service-windows?branchId=${branchId}` : `${API_BASE_URL}/service-windows`;
      console.log(`[Manage Windows] Fetching windows from: ${url}`); // Debug log
      const response = await axios.get(url);
      console.log("[Manage Windows] Received windows data:", response.data); // Debug log
      setServiceWindows(response.data);
    } catch (error) {
      console.error("Error fetching service windows:", error.response?.data || error.message);
      showPopupMessage(setPopup, "error", "Failed to load service windows.");
      setServiceWindows([]);
    } finally {
      setLoadingServiceWindows(false);
    }
  }, [setPopup]);


  // NEW: Function to fetch overall dashboard summary data (can be filtered by branch)
  const fetchOverallDashboardSummary = useCallback(async (branchId) => {
    setLoadingOverallDashboard(true);
    setOverallDashboardError(null);
    try {
      const url = branchId ? `${API_BASE_URL}/api/dashboard/summary?branchId=${branchId}` : `${API_BASE_URL}/api/dashboard/summary`;
      const response = await axios.get(url);
      setOverallDashboardSummary(response.data);
    } catch (err) {
      console.error("Error fetching overall dashboard summary:", err);
      setOverallDashboardError("Failed to load overall dashboard summary.");
      setOverallDashboardSummary({ totalQueued: 0, served: 0, requeues: 0, cancelled: 0 });
    } finally {
      setLoadingOverallDashboard(false);
    }
  }, []);

  // NEW: Function to fetch overall queue history and chart data (can be filtered by branch and period)
  const fetchOverallQueueHistoryData = useCallback(async (branchId, period = 'day', startDate = '', endDate = '') => {
    setLoadingOverallDashboard(true);
    setOverallDashboardError(null);
    try {
      const params = new URLSearchParams({ period });
      if (branchId) params.append('branchId', branchId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_BASE_URL}/api/dashboard/queue-history?${params.toString()}`;
      const summaryResponse = await axios.get(url);
      setOverallQueueHistorySummary(summaryResponse.data.totalQueued, summaryResponse.data.pwd,
        summaryResponse.data.seniorCitizens, summaryResponse.data.standard, summaryResponse.data.cancelled
      );
    } catch (err) {
      console.error("Error fetching overall queue history data:", err);
      setOverallDashboardError("Failed to load overall queue history.");
      setOverallQueueHistorySummary({ totalQueued: 0, pwd: 0, seniorCitizens: 0, standard: 0, cancelled: 0 });
    } finally {
      setLoadingOverallDashboard(false);
    }
  }, []);


  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const roleId = localStorage.getItem("roleId");
      const storedFullName = localStorage.getItem("fullName");

      if (!isLoggedIn || roleId !== "1") { // Super Admin roleId is 1
        console.warn("Unauthorized access. Redirecting to login.");
        navigate('/SuperAdminLogin', { replace: true });
      } else {
        setFullName(storedFullName || 'Super Admin');
        fetchAdminUsers();
        fetchBranches();
        // Initial fetches for new sections
        fetchStaffUsers(selectedStaffFilterBranchId); // Ensure initial fetch respects default filter
        fetchServiceWindows(selectedWindowFilterBranchId); // Ensure initial fetch respects default filter
      }
    };

    checkAuth();

    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, [navigate, fetchAdminUsers, fetchBranches, fetchStaffUsers, fetchServiceWindows, selectedStaffFilterBranchId, selectedWindowFilterBranchId]); // Added filter dependencies here for initial load

  // Effect to fetch data when currentView or filters change
  useEffect(() => {
    if (currentView === 'overall-dashboard') {
      fetchOverallDashboardSummary(selectedBranchFilter);
      fetchOverallQueueHistoryData(selectedBranchFilter, selectedPeriod, customStartDate, customEndDate);
    } else if (currentView === 'staff') {
      fetchStaffUsers(selectedStaffFilterBranchId);
    } else if (currentView === 'windows') {
      fetchServiceWindows(selectedWindowFilterBranchId);
    }
  }, [currentView, selectedBranchFilter, selectedPeriod, customStartDate, customEndDate, selectedStaffFilterBranchId, selectedWindowFilterBranchId, fetchOverallDashboardSummary, fetchOverallQueueHistoryData, fetchStaffUsers, fetchServiceWindows]);


  const handleOpenAddAdminModal = () => setShowAddAdminModal(true);
  const handleCloseAddAdminModal = () => setShowAddAdminModal(false);

  const handleOpenEditAdminModal = (user) => {
    setSelectedUser(user);
    setShowEditAdminModal(true);
  };
  const handleCloseEditAdminModal = () => {
    setSelectedUser(null);
    setShowEditAdminModal(false);
  };

  const handleOpenAddBranchModal = () => setShowAddBranchModal(true);
  const handleCloseAddBranchModal = () => setShowAddBranchModal(false);

  const handleOpenEditBranchModal = (branch) => {
    setSelectedBranch(branch);
    setShowEditBranchModal(true);
  };
  const handleCloseEditBranchModal = () => {
    setSelectedBranch(null);
    setShowEditBranchModal(false);
  };

  // NEW: Handlers for Staff Modals
  const handleOpenEditStaffModal = (staff) => {
    setSelectedStaff(staff);
    setShowEditStaffModal(true);
  };
  const handleCloseEditStaffModal = () => {
    setSelectedStaff(null);
    setShowEditStaffModal(false);
  };

  // NEW: Handlers for Window Modals
  const handleOpenEditWindowModal = (window) => {
    setSelectedWindow(window);
    setShowEditWindowModal(true);
  };
  const handleCloseEditWindowModal = () => {
    setSelectedWindow(null);
    setShowEditWindowModal(false);
  };


  const handleAdminOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    fetchAdminUsers();
    handleCloseAddAdminModal();
    handleCloseEditAdminModal();
  };

  const handleBranchOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    fetchBranches();
    handleCloseAddBranchModal();
    handleCloseEditBranchModal();
  };

  // NEW: Generic success handler for staff operations
  const handleStaffOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    fetchStaffUsers(selectedStaffFilterBranchId); // Refresh staff list with current filter
    handleCloseEditStaffModal();
  };

  // NEW: Generic success handler for window operations
  const handleWindowOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    fetchServiceWindows(selectedWindowFilterBranchId); // Refresh windows list with current filter
    handleCloseEditWindowModal();
  };


  const handleAdminOperationError = (errorMessage) => {
    showPopupMessage(setPopup, "error", errorMessage);
  };

  const handleBranchOperationError = (errorMessage) => {
    showPopupMessage(setPopup, "error", errorMessage);
  };

  // NEW: Error handler for staff operations
  const handleStaffOperationError = (errorMessage) => {
    showPopupMessage(setPopup, "error", errorMessage);
  };

  // NEW: Error handler for window operations
  const handleWindowOperationError = (errorMessage) => {
    showPopupMessage(setPopup, "error", errorMessage);
  };


  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/SuperAdminLogin', { replace: true });
  };

  // NEW: Navigation items updated to include 'staff' and 'windows'
  const navItems = [
    { text: 'Overall Dashboard', icon: <DashboardIcon sx={{ color: '#8ab4f8' }} />, view: 'overall-dashboard' },
    { text: 'Manage Admins', icon: <GroupIcon sx={{ color: '#8ab4f8' }} />, view: 'users' },
    { text: 'Manage Staff', icon: <PeopleIcon sx={{ color: '#8ab4f8' }} />, view: 'staff' }, // New
    { text: 'Manage Windows', icon: <WindowIcon sx={{ color: '#8ab4f8' }} />, view: 'windows' }, // New
    { text: 'Manage Branches', icon: <BusinessIcon sx={{ color: '#8ab4f8' }} />, view: 'branches' },
  ];

  // NEW: Chart data for the overall dashboard
  // const overallChartData = [
  //   { name: 'Total Queued', value: overallQueueHistorySummary.totalQueued },
  //   { name: 'PWD', value: overallQueueHistorySummary.pwd },
  //   { name: 'Senior Citizens', value: overallQueueHistorySummary.seniorCitizens },
  //   { name: 'Standard', value: overallQueueHistorySummary.standard },
  //   { name: 'Cancelled', value: overallQueueHistorySummary.cancelled },
  // ].filter(data => data.value > 0);
  const overallChartData = [
    { name: 'Total Queued', value:overallDashboardSummary.totalQueued },
    { name: 'PWD', value: overallDashboardSummary.served },
    { name: 'Senior Citizens', value: overallDashboardSummary.requeues },
    { name: 'Cancelled', value: overallQueueHistorySummary.cancelled },
  ].filter(data => data.value > 0);
  
  const renderContent = () => {
    // Centralized loading/error handling for the main content area
    const isLoading = (currentView === 'overall-dashboard' && loadingOverallDashboard) ||
                      (currentView === 'users' && loadingUsers) ||
                      (currentView === 'branches' && loadingBranches) ||
                      (currentView === 'staff' && loadingStaffUsers) || // NEW
                      (currentView === 'windows' && loadingServiceWindows); // NEW

    const currentError = (currentView === 'overall-dashboard' && overallDashboardError) || null; // Only overall dashboard has its own error state for now

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column' }}>
          <CircularProgress sx={{ color: '#007bff' }} />
          <Typography sx={{ mt: 2, color: '#e0e0e0' }}>Loading data...</Typography>
        </Box>
      );
    }

    if (currentError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column' }}>
          <Typography color="error" variant="h6">Error: {currentError}</Typography>
          <MuiButton onClick={() => {
            if (currentView === 'overall-dashboard') {
              fetchOverallDashboardSummary(selectedBranchFilter);
              fetchOverallQueueHistoryData(selectedBranchFilter, selectedPeriod, customStartDate, customEndDate);
            } else if (currentView === 'users') {
              fetchAdminUsers();
            } else if (currentView === 'branches') {
              fetchBranches();
            } else if (currentView === 'staff') { // NEW
              fetchStaffUsers(selectedStaffFilterBranchId);
            } else if (currentView === 'windows') { // NEW
              fetchServiceWindows(selectedWindowFilterBranchId);
            }
          }} sx={{ mt: 2, color: '#007bff' }}>Retry</MuiButton>
        </Box>
      );
    }

    switch (currentView) {
      case 'overall-dashboard':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              OVERALL DASHBOARD
            </Typography>

            {/* Branch Filter and Date Filters */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 4 }}>
              <FormControl sx={{ minWidth: 200, bgcolor: '#1f1f1f', borderRadius: '10px' }} size="small">
                <InputLabel sx={{ color: '#8ab4f8' }}>Filter by Branch</InputLabel>
                <Select
                  value={selectedBranchFilter}
                  label="Filter by Branch"
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  sx={{
                    color: '#e0e0e0',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100, 110, 130, 0.2)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007bff' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100, 110, 130, 0.4)' },
                    '& .MuiSvgIcon-root': { color: '#8ab4f8' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#1a1a1a',
                        color: '#e0e0e0',
                        border: '1px solid rgba(100, 110, 130, 0.2)',
                        '& .MuiMenuItem-root': {
                          color: '#e0e0e0',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(0, 123, 255, 0.2)',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <CustomSearchTextField
                label="Date From"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: '180px' }}
              />
              <CustomSearchTextField
                label="Date To"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: '180px' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4, bgcolor: '#1a1a1a', borderRadius: '10px', p: 1, border: '1px solid rgba(100, 110, 130, 0.1)' }}>
              {['Day', 'Week', 'Month', 'Year'].map((periodOption) => (
                <MuiButton
                  key={periodOption}
                  variant="text"
                  onClick={() => {
                    setSelectedPeriod(periodOption.toLowerCase());
                    setCustomStartDate(''); // Clear custom dates when a predefined period is selected
                    setCustomEndDate('');
                  }}
                  sx={{
                    color: '#e0e0e0',
                    fontWeight: 600,
                    flex: 1,
                    py: 1.5,
                    borderRadius: '8px',
                    bgcolor: selectedPeriod === periodOption.toLowerCase() ? '#007bff' : 'transparent',
                    '&:hover': { bgcolor: selectedPeriod === periodOption.toLowerCase() ? '#0056b3' : 'rgba(0, 123, 255, 0.1)' },
                  }}
                >
                  {periodOption}
                </MuiButton>
              ))}
            </Box>

            {/* Overall Dashboard Summary Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 3, mb: 5 }}>
              {[
                { title: 'Total Queued', value: overallDashboardSummary.totalQueued, icon: <QueueIcon sx={{ fontSize: '4rem' }} />, color: '#ffc107' },
                { title: 'Served', value: overallDashboardSummary.served, icon: <CheckCircleOutlineIcon sx={{ fontSize: '4rem' }} />, color: '#28a745' },
                { title: 'Requeues', value: overallDashboardSummary.requeues, icon: <LoopIcon sx={{ fontSize: '4rem' }} />, color: '#17a2b8' },
                { title: 'Cancelled', value: overallDashboardSummary.cancelled, icon: <CancelIcon sx={{ fontSize: '4rem' }} />, color: '#dc3545' },
              ].map((card, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 200px',
                    minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 24px)' },
                    p: 3,
                    bgcolor: '#1a1a1a',
                    borderRadius: '12px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-5px)' },
                  }}
                >
                  <Box sx={{ color: card.color, mb: 1 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: '#e0e0e0', fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ color: card.color, fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Overall Queue Breakdown Chart */}
            <Box sx={{ p: 3, bgcolor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ color: '#8ab4f8', mb: 2 }}>
                Overall Queue Breakdown
              </Typography>
              {overallChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overallChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {overallChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fdfdfdff', border: 'none', borderRadius: '8px', color: '#e0e0e0' }} />
                    <Legend wrapperStyle={{ color: '#e0e0e0' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: '#a0a0a0' }}>No data available for the chart based on current filters.</Typography>
              )}
            </Box>
          </Box>
        );
      case 'users':
        return (
          <>
            {/* Users Section Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#f0f0f0', fontWeight: 600, fontSize: '2.2rem' }}>
                  Admins
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  Manage the admin
                </Typography>
              </Box>
              <MuiButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddAdminModal}
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.4)',
                  },
                  fontSize: '0.9rem',
                }}
              >
                Add Admin
              </MuiButton>
            </Box>

            {/* User Table */}
            <TableContainer component={Paper} sx={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: 'none',
              border: '1px solid rgba(100, 110, 130, 0.1)',
              overflow: 'hidden',
            }}>
              <Table sx={{ minWidth: 650 }} aria-label="user table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Name</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Email</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Role</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Branch</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#e0e0e0' }}>No admin users found.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#1f1f1f' },
                          '&:nth-of-type(even)': { backgroundColor: '#1a1a1a' },
                          '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.05)' },
                          borderBottom: '1px solid rgba(100, 110, 130, 0.05)',
                        }}
                      >
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{user.name}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{user.email}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{user.role}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{user.branchName}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <Typography
                            variant="body2"
                            className={user.status === 'Active' ? 'status-active' : 'status-inactive'}
                            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            {user.status}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={() => handleOpenEditAdminModal(user)}
                            sx={{
                              color: '#007bff',
                              borderColor: '#007bff',
                              borderRadius: '15px',
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              py: '4px',
                              px: '12px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                borderColor: '#0056b3',
                              },
                            }}
                          >
                            Edit
                          </MuiButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      case 'staff': // NEW: Manage Staff Section
        return (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#f0f0f0', fontWeight: 600, fontSize: '2.2rem' }}>
                  Staff Members
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  View and manage all staff across branches.
                </Typography>
              </Box>
              <FormControl sx={{ minWidth: 200, bgcolor: '#1f1f1f', borderRadius: '10px' }} size="small">
                <InputLabel sx={{ color: '#8ab4f8' }}>Filter by Branch</InputLabel>
                <Select
                  value={selectedStaffFilterBranchId}
                  label="Filter by Branch"
                  onChange={(e) => setSelectedStaffFilterBranchId(e.target.value)}
                  sx={{
                    color: '#e0e0e0',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100, 110, 130, 0.2)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007bff' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100, 110, 130, 0.4)' },
                    '& .MuiSvgIcon-root': { color: '#8ab4f8' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#1a1a1a',
                        color: '#e0e0e0',
                        border: '1px solid rgba(100, 110, 130, 0.2)',
                        '& .MuiMenuItem-root': {
                          color: '#e0e0e0',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(0, 123, 255, 0.2)',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: 'none',
              border: '1px solid rgba(100, 110, 130, 0.1)',
              overflow: 'hidden',
            }}>
              <Table sx={{ minWidth: 650 }} aria-label="staff table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Full Name</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Branch</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#e0e0e0' }}>No staff users found.</TableCell>
                    </TableRow>
                  ) : (
                    staffUsers.map((staff) => (
                      <TableRow
                        key={staff.staffId}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#1f1f1f' },
                          '&:nth-of-type(even)': { backgroundColor: '#1a1a1a' },
                          '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.05)' },
                          borderBottom: '1px solid rgba(100, 110, 130, 0.05)',
                        }}
                      >
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{staff.fullName}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{staff.branch?.branchName || 'N/A'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <Typography
                            variant="body2"
                            className={staff.isActive ? 'status-active' : 'status-inactive'}
                            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={() => handleOpenEditStaffModal(staff)}
                            sx={{
                              color: '#007bff',
                              borderColor: '#007bff',
                              borderRadius: '15px',
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              py: '4px',
                              px: '12px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                borderColor: '#0056b3',
                              },
                            }}
                          >
                            Edit
                          </MuiButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      case 'windows': // NEW: Manage Windows Section
        return (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#f0f0f0', fontWeight: 600, fontSize: '2.2rem' }}>
                  Service Windows
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  View and manage all service windows across branches.
                </Typography>
              </Box>
              <FormControl sx={{ minWidth: 200, bgcolor: '#1f1f1f', borderRadius: '10px' }} size="small">
                <InputLabel sx={{ color: '#8ab4f8' }}>Filter by Branch</InputLabel>
                <Select
                  value={selectedWindowFilterBranchId}
                  label="Filter by Branch"
                  onChange={(e) => {
                    console.log(`[Manage Windows Filter] Selected branch ID: ${e.target.value}`); // Debug log
                    setSelectedWindowFilterBranchId(e.target.value);
                  }}
                  sx={{
                    color: '#e0e0e0',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100, 110, 130, 0.2)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007bff' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100, 110, 130, 0.4)' },
                    '& .MuiSvgIcon-root': { color: '#8ab4f8' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#1a1a1a',
                        color: '#e0e0e0',
                        border: '1px solid rgba(100, 110, 130, 0.2)',
                        '& .MuiMenuItem-root': {
                          color: '#e0e0e0',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(0, 123, 255, 0.2)',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: 'none',
              border: '1px solid rgba(100, 110, 130, 0.1)',
              overflow: 'hidden',
            }}>
              <Table sx={{ minWidth: 650 }} aria-label="service windows table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Window Number</TableCell>
                    {/* NEW: Added TableCell for Window Name */}
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Window Name</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Branch</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Active Status</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Visibility Status</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceWindows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#e0e0e0' }}>No service windows found.</TableCell>
                    </TableRow>
                  ) : (
                    serviceWindows.map((window) => (
                      <TableRow
                        key={window.windowId}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#1f1f1f' },
                          '&:nth-of-type(even)': { backgroundColor: '#1a1a1a' },
                          '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.05)' },
                          borderBottom: '1px solid rgba(100, 110, 130, 0.05)',
                        }}
                      >
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{window.windowNumber}</TableCell>
                        {/* NEW: Added TableCell for Window Name */}
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{window.windowName || 'N/A'}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{window.branch?.branchName || 'N/A'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <Typography
                            variant="body2"
                            className={window.isActive ? 'status-active' : 'status-inactive'}
                            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            {window.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <Typography
                            variant="body2"
                            className={window.visibilityStatus === 'ON_LIVE' ? 'status-active' : 'status-inactive'}
                            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            {window.visibilityStatus === 'ON_LIVE' ? 'On Live' : 'On Delete'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={() => handleOpenEditWindowModal(window)}
                            sx={{
                              color: '#007bff',
                              borderColor: '#007bff',
                              borderRadius: '15px',
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              py: '4px',
                              px: '12px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                borderColor: '#0056b3',
                              },
                            }}
                          >
                            Edit
                          </MuiButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      case 'branches':
        return (
          <>
            {/* Branches Section Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#f0f0f0', fontWeight: 600, fontSize: '2.2rem' }}>
                  Branches
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  Manage the branches
                </Typography>
              </Box>
              <MuiButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddBranchModal}
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.4)',
                  },
                  fontSize: '0.9rem',
                }}
              >
                Add Branch
              </MuiButton>
            </Box>

            {/* Branches Table */}
            <TableContainer component={Paper} sx={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: 'none',
              border: '1px solid rgba(100, 110, 130, 0.1)',
              overflow: 'hidden',
            }}>
              <Table sx={{ minWidth: 650 }} aria-label="branch table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Name</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Location</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Contact</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#e0e0e0' }}>No branches found.</TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch) => (
                      <TableRow
                        key={branch.branchId}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#1f1f1f' },
                          '&:nth-of-type(even)': { backgroundColor: '#1a1a1a' },
                          '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.05)' },
                          borderBottom: '1px solid rgba(100, 110, 130, 0.05)',
                        }}
                      >
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{branch.branchName}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{branch.branchLocation}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.9rem', borderBottom: 'none', padding: '10px 16px' }}>{branch.contactNumber}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <Typography
                            variant="body2"
                            className={branch.visibilityStatus === 'ON_LIVE' ? 'status-active' : 'status-inactive'}
                            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            {branch.visibilityStatus === 'ON_LIVE' ? 'Active' : 'Deleted'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', padding: '10px 16px' }}>
                          <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={() => handleOpenEditBranchModal(branch)}
                            sx={{
                              color: '#007bff',
                              borderColor: '#007bff',
                              borderRadius: '15px',
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              py: '4px',
                              px: '12px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                borderColor: '#0056b3',
                              },
                            }}
                          >
                            Edit
                          </MuiButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      default:
        return <Typography sx={{ p: 3, color: '#e0e0e0' }}>Select a page from the sidebar.</Typography>;
    }
  };

  const drawer = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0',
    }}>
      {/* Profile Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column', // Changed to column to stack items
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Avatar sx={{ bgcolor: '#007bff', width: 90, height: 90 }}>
          <AccountCircle sx={{ color: 'white', fontSize: '104px' }} />
        </Avatar>
        <Box sx={{ textAlign: 'center' }}> {/* Added textAlign to center text */}
          <Typography
            variant="body1"
            sx={{ color: '#e0e0e0', fontWeight: 600,
                  fontSize: {
                    xs: '1rem',   // On extra small screens
                    sm: '1.2rem', // On small screens and up
                    md: '1.5rem', // On medium screens and up
                  },
                  lineHeight: 1.2 }} // Adjusted line height for better readability}
          >
            {fullName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}
          >
            Super-Administrator
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(100, 110, 130, 0.1)' }} />

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => setCurrentView(item.view)}
              selected={currentView === item.view}
              sx={{
                py: 1.5, // Changed from 4 to 1.5 for more compact list items
                px: 3, // Changed from 5 to 3 for more compact list items
                // Apply border-radius to all items for consistent shape
                borderRadius: '3px 8px 8px 9px',
                marginBottom: '7px',
                // Conditional styling for selected state
                backgroundColor: currentView === item.view ? 'rgba(0, 123, 255, 0.15)' : 'transparent',
                borderLeft: currentView === item.view ? '4px solid #007bff' : '4px solid transparent',
                '&:hover': {
                  backgroundColor: currentView === item.view ? 'rgba(0, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  // Removed borderBottom on hover to maintain text style
                  // borderBottom: '3px solid #007bff', // REMOVED THIS LINE
                },
                // Ensure consistent height by explicitly setting minHeight if needed,
                // though padding and border should typically align them now.
                minHeight: '50px',
                height: '48px',
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(100, 110, 130, 0.1)' }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{
              py: 1.5,
              px: 3,
              borderRadius: '3px 8px 8px 10px',
              borderLeft: '4px solid transparent',
              borderColor: 'red',
            }}>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <ExitToAppIcon sx={{ color: '#dc3545' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }} className="sa-dashboard-page">
      <CssBaseline />
      {/* App Bar (Header) */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px - 710px)` }, // Reduced width by 20px overall
          ml: { sm: `calc(${drawerWidth}px + 10px)` }, // Adjusted margin-left for centering with reduction
          backgroundColor: 'transparent !important', // Made background transparent
          boxShadow: 'none',
          borderBottom: '1px solid rgba(100, 110, 130, 0)',
          borderColor:'transparent !important',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '0 0 10px 10px', // Curved bottom-left and bottom-right corners
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', justifyContent: 'flex-end', pr: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#e0e0e0' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ color: '#e0e0e0', fontWeight: 500, fontSize: '1rem' }}>
              {currentTime}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
              {currentDate}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Drawer) */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid rgba(100, 110, 130, 0.1)',
              borderTopRightRadius: '15px', // Curved top-right
              borderBottomRightRadius: '15px', // Curved bottom-right
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid rgba(100, 110, 130, 0.1)',
              borderTopRightRadius: '30px', // Curved top-right
              borderBottomRightRadius: '30px', // Curved bottom-right
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: '#121212',
          minHeight: 'calc(100vh - 64px)',
          color: '#e0e0e0',
        }}
      >
        <Toolbar sx={{ display: { xs: 'block', sm: 'none' } }} />

        {renderContent()}
      </Box>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <AddAdminForm
          onClose={handleCloseAddAdminModal}
          onAdminAdded={handleAdminOperationSuccess}
          onAdminOperationError={handleAdminOperationError}
          setPopup={setPopup}
          branches={branches}
          loadingBranches={loadingBranches}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditAdminModal && selectedUser && (
        <EditAdminForm
          onClose={handleCloseEditAdminModal}
          userData={selectedUser}
          onAdminUpdated={handleAdminOperationSuccess}
          onAdminDeleted={handleAdminOperationSuccess}
          onAdminOperationError={handleAdminOperationError}
          setPopup={setPopup}
          branches={branches}
          loadingBranches={loadingBranches}
        />
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <AddBranchForm
          onClose={handleCloseAddBranchModal}
          onBranchAdded={handleBranchOperationSuccess}
          onBranchOperationError={handleBranchOperationError}
          setPopup={setPopup}
        />
      )}

      {/* Edit Branch Modal */}
      {showEditBranchModal && selectedBranch && (
        <EditBranchForm
          onClose={handleCloseEditBranchModal}
          branchData={selectedBranch}
          onBranchUpdated={handleBranchOperationSuccess}
          onBranchDeleted={handleBranchOperationSuccess}
          onBranchOperationError={handleBranchOperationError}
          setPopup={setPopup}
        />
      )}

      {/* NEW: Edit Staff Modal */}
      {showEditStaffModal && selectedStaff && (
        <EditStaffForm
          onClose={handleCloseEditStaffModal}
          userData={selectedStaff} // Reusing userData prop, ensure it's compatible
          onStaffUpdated={handleStaffOperationSuccess}
          onStaffDeleted={handleStaffOperationSuccess} // Assuming delete is also handled here
          onStaffOperationError={handleStaffOperationError}
          setPopup={setPopup}
          branches={branches}
          loadingBranches={loadingBranches}
        />
      )}

      {/* NEW: Edit Window Modal */}
      {showEditWindowModal && selectedWindow && (
        <EditWindowForm
          onClose={handleCloseEditWindowModal}
          windowData={selectedWindow} // Assuming windowData prop
          onWindowUpdated={handleWindowOperationSuccess}
          onWindowDeleted={handleWindowOperationSuccess} // Assuming delete is also handled here
          onWindowOperationError={handleWindowOperationError}
          setPopup={setPopup}
          branches={branches} // Pass branches for dropdowns in form
          loadingBranches={loadingBranches}
        />
      )}

      {/* Popup Message Component */}
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </Box>
  );
};

export default SuperAdminDashboard;

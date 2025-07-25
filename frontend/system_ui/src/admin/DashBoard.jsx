// src/admin/Dashboard.jsx
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
  Button as MuiButton,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import WindowIcon from '@mui/icons-material/Window';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QueueIcon from '@mui/icons-material/Queue';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoopIcon from '@mui/icons-material/Loop';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import WheelchairPickupIcon from '@mui/icons-material/WheelchairPickup';
import ElderlyIcon from '@mui/icons-material/Elderly';
import BusinessIcon from '@mui/icons-material/Business';

import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// Recharts imports for the Pie Chart
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import './Dashboard.css';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios';

// Import the new staff management forms
import AddStaffForm from './popup-forms/AddStaffForm';
import EditStaffForm from './popup-forms/EditStaffForm';

// Styled TextField for search input
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

const drawerWidth = 240;
const API_BASE_URL = 'http://localhost:3000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Admin User');
  const [branchName, setBranchName] = useState('Loading Branch...');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [popup, setPopup] = useState(null);

  // States for dynamic data
  const [dashboardSummary, setDashboardSummary] = useState({
    totalQueued: 0, served: 0, requeues: 0, cancelled: 0
  });
  const [queuesData, setQueuesData] = useState([]);
  const [windowsAssignedData, setWindowsAssignedData] = useState([]);
  const [queueHistorySummary, setQueueHistorySummary] = useState({
    totalQueued: 0, pwd: 0, seniorCitizens: 0, standard: 0, cancelled: 0
  });
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaffUser, setSelectedStaffUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);


  // Pie chart colors (consistent with previous design)
  const PIE_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  // Function to fetch dashboard summary data
  const fetchDashboardSummary = useCallback(async (branchId) => {
    if (!branchId) {
      setDashboardSummary({ totalQueued: 0, served: 0, requeues: 0, cancelled: 0 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/summary?branchId=${branchId}`);
      setDashboardSummary(response.data);
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      setError("Failed to load dashboard summary.");
      setDashboardSummary({ totalQueued: 0, served: 0, requeues: 0, cancelled: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch queues data
  const fetchQueuesData = useCallback(async (branchId) => {
    if (!branchId) {
      setQueuesData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/queues?branchId=${branchId}`);
      setQueuesData(response.data.map(q => ({
        name: q.customerName,
        number: q.ticketNumber,
        category: q.category,
        status: q.status,
      })));
    } catch (err) {
      console.error("Error fetching queues data:", err);
      setError("Failed to load queues data.");
      setQueuesData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch windows assigned data
  const fetchWindowsAssignedData = useCallback(async (branchId) => {
    if (!branchId) {
      setWindowsAssignedData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/windows-assigned?branchId=${branchId}`);
      setWindowsAssignedData(response.data);
    } catch (err) {
      console.error("Error fetching windows assigned data:", err);
      setError("Failed to load window assignments.");
      setWindowsAssignedData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch queue history and chart data
  const fetchQueueHistoryData = useCallback(async (branchId, period = 'day', startDate = '', endDate = '') => {
    if (!branchId) {
      setQueueHistorySummary({ totalQueued: 0, pwd: 0, seniorCitizens: 0, standard: 0, cancelled: 0 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ branchId: branchId, period });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const summaryResponse = await axios.get(`${API_BASE_URL}/api/dashboard/queue-history?${params.toString()}`);
      setQueueHistorySummary(summaryResponse.data);
    } catch (err) {
      console.error("Error fetching queue history data:", err);
      setError("Failed to load queue history.");
      setQueueHistorySummary({ totalQueued: 0, pwd: 0, seniorCitizens: 0, standard: 0, cancelled: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch staff users for the current branch
  const fetchStaffUsers = useCallback(async (branchId) => {
    if (!branchId) {
      setStaffUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch users for the specific branch and roleId 3 (Staff)
      const response = await axios.get(`${API_BASE_URL}/users?branchId=${branchId}&roleId=3`); // Assuming roleId 3 for Staff
      setStaffUsers(response.data);
    } catch (err) {
      console.error("Error fetching staff users:", err);
      setError("Failed to load staff users.");
      setStaffUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);


  // Function to fetch branch name
  const fetchBranchName = useCallback(async (branchId) => {
    if (!branchId) {
      setBranchName('No Branch Assigned');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/branches/${branchId}`);
      setBranchName(response.data.branchName || 'Unknown Branch');
    } catch (err) {
      console.error("Error fetching branch name:", err);
      setBranchName('Error Loading Branch');
    }
  }, []);


  // Main useEffect for initial auth check and data fetching based on currentPage
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const roleId = localStorage.getItem("roleId");
    const storedFullName = localStorage.getItem("fullName");
    const storedBranchId = localStorage.getItem("branchId");

    console.log("[Dashboard] Stored Branch ID from localStorage:", storedBranchId);

    if (!isLoggedIn || roleId !== "2") {
      showPopupMessage(setPopup, "error", "Access Denied. Please login as an Admin.");
      localStorage.clear();
      navigate('/Adminlogin', { replace: true });
      setLoading(false);
      return;
    }

    setFullName(storedFullName || 'Admin User');

    const isValidBranchId = storedBranchId && storedBranchId !== 'undefined' && storedBranchId !== 'null';

    if (!isValidBranchId) {
        setBranchName('No Branch Assigned');
        setLoading(false);
        setError("No branch assigned to this admin. Data cannot be loaded.");
    } else {
        fetchBranchName(storedBranchId);
        if (currentPage === 'Dashboard') {
            fetchDashboardSummary(storedBranchId);
            fetchQueuesData(storedBranchId);
        } else if (currentPage === 'Queue Monitoring') {
            fetchQueueHistoryData(storedBranchId);
        } else if (currentPage === 'Window Assigned') {
            fetchWindowsAssignedData(storedBranchId);
        } else if (currentPage === 'Manage Staff') {
            fetchStaffUsers(storedBranchId);
        }
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigate, currentPage, fetchDashboardSummary, fetchQueuesData, fetchWindowsAssignedData, fetchQueueHistoryData, fetchBranchName, fetchStaffUsers]);


  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    showPopupMessage(setPopup, "success", "Logged out successfully!");
    setShowLogoutModal(false);
    navigate('/Adminlogin', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Handlers for Add Staff Modal
  const handleShowAddStaffModal = () => {
    setShowAddStaffModal(true);
  };

  const handleCloseAddStaffModal = () => {
    setShowAddStaffModal(false);
  };

  // Handlers for Edit Staff Modal
  const handleShowEditStaffModal = (user) => {
    setSelectedStaffUser(user);
    setShowEditStaffModal(true);
  };

  const handleCloseEditStaffModal = () => {
    setSelectedStaffUser(null);
    setShowEditStaffModal(false);
  };

  // Generic success/error handlers for staff operations
  const handleStaffOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    const currentBranchId = localStorage.getItem("branchId");
    if (currentBranchId) {
      fetchStaffUsers(currentBranchId); // Refresh staff list
      fetchWindowsAssignedData(currentBranchId); // Also refresh window assignments in case staff names are displayed there
    }
  };

  const handleStaffOperationError = (message) => {
    showPopupMessage(setPopup, "error", message);
  };


  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#8ab4f8' }} />, path: 'Dashboard' },
    { text: 'Queue Monitoring', icon: <BarChartIcon sx={{ color: '#8ab4f8' }} />, path: 'Queue Monitoring' },
    { text: 'Window Assigned', icon: <WindowIcon sx={{ color: '#8ab4f8' }} />, path: 'Window Assigned' },
    { text: 'Manage Staff', icon: <PeopleIcon sx={{ color: '#8ab4f8' }} />, path: 'Manage Staff' },
  ];

  const chartData = [
    { name: 'Total Queued', value: queueHistorySummary.totalQueued },
    { name: 'PWD', value: queueHistorySummary.pwd },
    { name: 'Senior Citizens', value: queueHistorySummary.seniorCitizens },
    { name: 'Standard', value: queueHistorySummary.standard },
    { name: 'Cancelled', value: queueHistorySummary.cancelled },
  ].filter(data => data.value > 0);


  const renderContent = () => {
    const currentBranchId = localStorage.getItem("branchId");

    if (error && !loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column' }}>
          <Typography color="error" variant="h6">Error: {error}</Typography>
          {currentBranchId && (
            <MuiButton onClick={() => {
              if (currentPage === 'Dashboard') {
                fetchDashboardSummary(currentBranchId);
                fetchQueuesData(currentBranchId);
              } else if (currentPage === 'Queue Monitoring') {
                fetchQueueHistoryData(currentBranchId);
              } else if (currentPage === 'Window Assigned') {
                fetchWindowsAssignedData(currentBranchId);
              } else if (currentPage === 'Manage Staff') {
                fetchStaffUsers(currentBranchId);
              }
            }} sx={{ mt: 2, color: '#007bff' }}>Retry</MuiButton>
          )}
        </Box>
      );
    }

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress sx={{ color: '#007bff' }} />
          <Typography sx={{ ml: 2, color: '#e0e0e0' }}>Loading data...</Typography>
        </Box>
      );
    }

    switch (currentPage) {
      case 'Dashboard':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              ADMIN DASHBOARD
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 3, mb: 5 }}>
              {[
                // MODIFIED: Added fontSize prop directly to each icon
                { title: 'Overall Total Queued', value: dashboardSummary.totalQueued, icon: <QueueIcon sx={{ fontSize: '4rem' }} />, color: '#ffc107' },
                { title: 'Overall Served', value: dashboardSummary.served, icon: <CheckCircleOutlineIcon sx={{ fontSize: '4rem' }} />, color: '#28a745' },
                { title: 'Overall Requeues', value: dashboardSummary.requeues, icon: <LoopIcon sx={{ fontSize: '4rem' }} />, color: '#17a2b8' },
                { title: 'Overall Cancelled', value: dashboardSummary.cancelled, icon: <CancelIcon sx={{ fontSize: '4rem' }} />, color: '#dc3545' },
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
                  {/* The outer Box's fontSize is no longer directly controlling the icon size */}
                  <Box sx={{ color: card.color, mb: 1 }}>
                    {card.icon} {/* The icon itself now has the fontSize prop */}
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

            <Box sx={{ p: 3, bgcolor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#8ab4f8', mb: 2 }}>
                QUEUES
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <CustomSearchTextField
                  placeholder="Search"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1, minWidth: '180px' }}
                />
                <MuiButton
                  variant="contained"
                  endIcon={<ArrowDropDownIcon />}
                  sx={{
                    bgcolor: '#1f1f1f',
                    color: '#e0e0e0',
                    borderRadius: '10px',
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 123, 255, 0.1)',
                    '&:hover': { bgcolor: 'rgba(0, 123, 255, 0.1)' },
                  }}
                >
                  Select Counter
                </MuiButton>
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Number</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuesData.length > 0 ? (
                      queuesData.map((queue, index) => (
                        <tr key={index} className={queue.category === 'Priority' ? 'priority-row' : ''}>
                          <td data-label="Name">{queue.name}</td>
                          <td data-label="Number">{queue.number}</td>
                          <td data-label="Category">{queue.category}</td>
                          <td data-label="Status">{queue.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#a0a0a0' }}>No queue data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Box>
          </Box>
        );
      case 'Queue Monitoring':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Queue History
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
              <CustomSearchTextField
                label="Date From"
                type="date"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <CustomSearchTextField
                label="Date To"
                type="date"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4, bgcolor: '#1a1a1a', borderRadius: '10px', p: 1, border: '1px solid rgba(100, 110, 130, 0.1)' }}>
              {['Day', 'Week', 'Month', 'Year'].map((tab) => (
                <MuiButton
                  key={tab}
                  variant="text"
                  sx={{
                    color: '#e0e0e0',
                    fontWeight: 600,
                    flex: 1,
                    py: 1.5,
                    borderRadius: '8px',
                    bgcolor: tab === 'Day' ? '#007bff' : 'transparent',
                    '&:hover': { bgcolor: tab === 'Day' ? '#0056b3' : 'rgba(0, 123, 255, 0.1)' },
                  }}
                >
                  {tab}
                </MuiButton>
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 3, mb: 5 }}>
              {[
                { title: 'Total Queued', value: dashboardSummary.totalQueued, icon: <QueueIcon sx={{ fontSize: '4rem' }} />, color: '#ffc107' },
                { title: 'Served', value: dashboardSummary.served, icon: <CheckCircleOutlineIcon sx={{ fontSize: '4rem' }} />, color: '#28a745' },
                { title: 'Requeues', value: dashboardSummary.requeues, icon: <LoopIcon sx={{ fontSize: '4rem' }} />, color: '#17a2b8' },
                { title: 'Cancelled', value: dashboardSummary.cancelled, icon: <CancelIcon sx={{ fontSize: '4rem' }} />, color: '#dc3545' },
              ].map((card, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 180px',
                    minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(20% - 24px)' },
                    p: 2.5,
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
                  <Box sx={{ color: card.color, fontSize: '2.5rem', mb: 1 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ color: '#e0e0e0', fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ color: card.color, fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ p: 3, bgcolor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ color: '#8ab4f8', mb: 2 }}>
                Queue Breakdown
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#e0e0e0' }} />
                    <Legend wrapperStyle={{ color: '#e0e0e0' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: '#a0a0a0' }}>No data available for the chart.</Typography>
              )}
            </Box>
          </Box>
        );
      case 'Window Assigned':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              WINDOWS ASSIGNED
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
              {/* This button will now open the AddCounterAndStaffForm */}
              <MuiButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPopup({ type: 'info', message: 'You can add new counters and assign staff through the "Manage Counters & Staff" modal. This button is for assigning staff to existing counters.' })}
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.4)',
                  },
                }}
              >
                Assign Staff to Counter
              </MuiButton>
              {/* This button is for adding a new counter (and optionally assigning staff) */}
              <MuiButton
                variant="contained"
                startIcon={<BusinessIcon />}
                onClick={() => setPopup({ type: 'info', message: 'This button will open the unified form to add new counters or assign staff.' })}
                sx={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
                  '&:hover': {
                    backgroundColor: '#218838',
                    boxShadow: '0 6px 15px rgba(40, 167, 69, 0.4)',
                  },
                }}
              >
                Add New Counter
              </MuiButton>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Counter</th>
                    <th>Counter Name</th>
                    <th>Staff</th>
                    <th>Total Queued</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {windowsAssignedData.length > 0 ? (
                    windowsAssignedData.map((window, index) => (
                      <tr key={index}>
                        <td data-label="Counter">{window.counter}</td>
                        <td data-label="Counter Name">{window.counterName}</td>
                        <td data-label="Staff">{window.staff}</td>
                        <td data-label="Total Queued">{window.totalQueued}</td>
                        <td data-label="Actions">
                          <IconButton size="small" sx={{ color: '#007bff' }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" sx={{ color: '#dc3545' }}><DeleteIcon fontSize="small" /></IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: '#a0a0a0' }}>No window assignment data available.</td></tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Box>
        );
      case 'Manage Staff':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              MANAGE STAFF
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <MuiButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleShowAddStaffModal}
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.4)',
                  },
                }}
              >
                Add Staff
              </MuiButton>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
                <Table className="data-table">
                  <TableHead>
                    <TableRow>
                      {/* Only display Full Name, Status, and Actions */}
                      <TableCell>Full Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffUsers.length > 0 ? (
                      staffUsers.map((staff) => (
                        <TableRow key={staff.userId}>
                          <TableCell data-label="Full Name">{staff.fullName}</TableCell>
                          <TableCell data-label="Status">
                            <span className={staff.isActive ? 'status-active' : 'status-inactive'}>
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell data-label="Actions">
                            <MuiButton
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleShowEditStaffModal(staff)}
                              sx={{
                                color: '#007bff',
                                borderColor: 'rgba(0, 123, 255, 0.5)',
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
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#a0a0a0' }}> {/* Changed colSpan to 3 */}
                          No staff users found for this branch.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
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
      <Box sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column', // Changed to column to stack items
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
        <Avatar sx={{ bgcolor: '#007bff', width: 90, height: 90 }}>
          <AccountCircle sx={{ color: 'white', fontSize: '104px' }} />
        </Avatar>
        <Box sx={{ textAlign: 'center' }}> {/* Added textAlign to center text */}
          <Typography
            variant="body1"
            sx={{
              color: '#e0e0e0',
              fontWeight: 600,
              fontSize: '1.2rem', // Set font size for the name
            }}
          >
            {fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
            Administrator
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(100, 110, 130, 0.1)' }} />

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={currentPage === item.path}
              onClick={() => setCurrentPage(item.path)}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: '3px 8px 8px 9px',
                marginBottom:'7px',
                backgroundColor: currentPage === item.path ? 'rgba(0, 123, 255, 0.15)' : 'transparent',
                borderLeft: currentPage === item.path ? '4px solid #007bff' : '4px solid transparent',
                '&:hover': {
                  backgroundColor: currentPage === item.path ? 'rgba(0, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '3px solid #007bff',
                },
                minHeight: '50px',
                height: '48px',
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
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
    <Box sx={{ display: 'flex' }} className="admin-dashboard-page">
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px - 710px)` }, // Reduced width by 20px overall
          ml: { sm: `calc(${drawerWidth}px + 10px)` }, // Adjusted margin-left for centering with reduction
          backgroundColor: 'transparent !important', // Made background transparent
          boxShadow: 'none',
          borderBottom: '1px solid rgba(100, 110, 130, 0)',
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
          <Typography
            variant="body1"
            sx={{
              bgcolor: '#1f1f1f',
              color: '#e0e0e0',
              borderRadius: '10px',
              px: 2,
              py: 1,
              fontWeight: 500,
              border: '1px solid rgba(0, 123, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: 2,
            }}
          >
            {branchName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1a1a',
              color: '#e0e0e0',
              display: { xs: 'block', sm: 'none' },
              zIndex: (theme) => theme.zIndex.drawer + 2,
              borderRadius: '0 15px 15px 0', // Applied border-radius
            }
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1a1a',
              color: '#e0e0e0',
              display: { xs: 'none', sm: 'block' },
              zIndex: (theme) => theme.zIndex.drawer + 1,
              borderRadius: '0 30px 30px 0', // Applied border-radius
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>
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

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <AddStaffForm
          onClose={handleCloseAddStaffModal}
          onStaffAdded={handleStaffOperationSuccess}
          onStaffOperationError={handleStaffOperationError}
          setPopup={setPopup}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && selectedStaffUser && (
        <EditStaffForm
          onClose={handleCloseEditStaffModal}
          userData={selectedStaffUser}
          onStaffUpdated={handleStaffOperationSuccess}
          onStaffDeleted={handleStaffOperationSuccess}
          onStaffOperationError={handleStaffOperationError}
          setPopup={setPopup}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Box className="modal-overlay">
          <Box className="logout-modal">
            <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 3 }}>
              Are you sure you want to log out?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <MuiButton
                variant="contained"
                onClick={confirmLogout}
                sx={{
                  backgroundColor: '#28a745',
                  '&:hover': { backgroundColor: '#218838' },
                }}
              >
                Yes
              </MuiButton>
              <MuiButton
                variant="contained"
                onClick={cancelLogout}
                sx={{
                  backgroundColor: '#dc3545',
                  '&:hover': { backgroundColor: '#c82333' },
                }}
              >
                No
              </MuiButton>
            </Box>
          </Box>
        </Box>
      )}

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

export default Dashboard;
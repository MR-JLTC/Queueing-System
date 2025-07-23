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
  // useMediaQuery,
  // useTheme,
  Button,
  CircularProgress, // For loading states
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

import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// Recharts imports for the Pie Chart
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import './Dashboard.css';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios';

// Styled TextField for search input
const CustomSearchTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#333b4d', // Dark background for search input
    color: '#e0e0e0', // Lighter text color
    borderRadius: '8px',
    height: '48px', // Slightly smaller height for search
    padding: '0 12px',
    fontSize: '16px',
    '&:hover fieldset': {
      borderColor: '#007bff !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007bff !important',
      boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.2)',
    },
    '& fieldset': {
      border: 'none', // Remove default border
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#a0a0a0',
    opacity: 1,
  },
  '& .MuiInputAdornment-root': {
    color: '#8ab4f8',
  },
  '& .MuiInputLabel-root': { // Style for date pickers' labels
    color: '#8ab4f8',
    fontSize: '16px',
    transform: 'translate(14px, 14px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
}));

const drawerWidth = 240;
const API_BASE_URL = 'http://localhost:3000';

const Dashboard = () => {
  const navigate = useNavigate();
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [fullName, setFullName] = useState('Admin User');
  const [branchName, setBranchName] = useState('Loading Branch...'); // State for branch name
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
  // const [queueBreakdownChartData, setQueueBreakdownChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pie chart colors
  const PIE_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']; // Example colors

  // Function to fetch dashboard summary data
  const fetchDashboardSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint for dashboard summary
      const response = await axios.get(`${API_BASE_URL}/api/dashboard-summary`); // Example endpoint
      setDashboardSummary(response.data);
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      setError("Failed to load dashboard summary.");
      setDashboardSummary({ totalQueued: 0, served: 0, requeues: 0, cancelled: 0 }); // Reset to default
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch queues data
  const fetchQueuesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint for queues
      const response = await axios.get(`${API_BASE_URL}/api/queues`); // Example endpoint
      setQueuesData(response.data);
    } catch (err) {
      console.error("Error fetching queues data:", err);
      setError("Failed to load queues data.");
      setQueuesData([]); // Reset to empty
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch windows assigned data
  const fetchWindowsAssignedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint for windows assigned
      const response = await axios.get(`${API_BASE_URL}/api/windows-assigned`); // Example endpoint
      setWindowsAssignedData(response.data);
    } catch (err) {
      console.error("Error fetching windows assigned data:", err);
      setError("Failed to load window assignments.");
      setWindowsAssignedData([]); // Reset to empty
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch queue history and chart data
  const fetchQueueHistoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint for queue history summary
      const summaryResponse = await axios.get(`${API_BASE_URL}/api/queue-history/summary`); // Example endpoint
      setQueueHistorySummary(summaryResponse.data);

      // Replace with your actual API endpoint for queue breakdown chart data
      // const chartResponse = await axios.get(`${API_BASE_URL}/api/queue-history/breakdown`); // Example endpoint
      // setQueueBreakdownChartData(chartResponse.data);
    } catch (err) {
      console.error("Error fetching queue history data:", err);
      setError("Failed to load queue history.");
      setQueueHistorySummary({ totalQueued: 0, pwd: 0, seniorCitizens: 0, standard: 0, cancelled: 0 });
      // setQueueBreakdownChartData([]);
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
      // Replace with your actual API endpoint for fetching branch by ID
      const response = await axios.get(`${API_BASE_URL}/api/branches/${branchId}`); // Example endpoint
      setBranchName(response.data.name || 'Unknown Branch');
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
    const storedBranchId = localStorage.getItem("branchId"); // Get branchId from localStorage

    if (!isLoggedIn || roleId !== "2") { // Ensure it's an Admin (roleId 2)
      showPopupMessage(setPopup, "error", "Access Denied. Please login as an Admin.");
      localStorage.clear(); // Clear any invalid login state
      navigate('/Adminlogin', { replace: true });
    } else {
      setFullName(storedFullName || 'Admin User');
      fetchBranchName(storedBranchId); // Fetch branch name on load
    }

    // Fetch data based on the current page
    if (currentPage === 'Dashboard') {
      fetchDashboardSummary();
      fetchQueuesData();
    } else if (currentPage === 'Queue Monitoring') {
      fetchQueueHistoryData();
    } else if (currentPage === 'Window Assigned') {
      fetchWindowsAssignedData();
    }

    // Update time and date every second
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [navigate, currentPage, fetchDashboardSummary, fetchQueuesData, fetchWindowsAssignedData, fetchQueueHistoryData, fetchBranchName]);


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
    setShowLogoutModal(true); // Show the confirmation modal
  };

  const confirmLogout = () => {
    localStorage.clear(); // Clear all local storage items
    showPopupMessage(setPopup, "success", "Logged out successfully!");
    setShowLogoutModal(false); // Close modal
    navigate('/Adminlogin', { replace: true }); // Redirect to login page
  };

  const cancelLogout = () => {
    setShowLogoutModal(false); // Close modal
  };

  // Navigation items for the sidebar
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'Dashboard' },
    { text: 'Queue Monitoring', icon: <BarChartIcon />, path: 'Queue Monitoring' },
    { text: 'Window Assigned', icon: <WindowIcon />, path: 'Window Assigned' },
  ];

  // Render content based on currentPage state
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress sx={{ color: '#007bff' }} />
          <Typography sx={{ ml: 2, color: '#e0e0e0' }}>Loading data...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column' }}>
          <Typography color="error" variant="h6">Error: {error}</Typography>
          <Button onClick={() => {
            // Retry fetching based on current page
            if (currentPage === 'Dashboard') fetchDashboardSummary();
            else if (currentPage === 'Queue Monitoring') fetchQueueHistoryData();
            else if (currentPage === 'Window Assigned') fetchWindowsAssignedData();
            else fetchQueuesData(); // Fallback
          }} sx={{ mt: 2, color: '#007bff' }}>Retry</Button>
        </Box>
      );
    }

    switch (currentPage) {
      case 'Dashboard':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              ADMIN DASHBOARD
            </Typography>

            {/* Summary Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 3, mb: 5 }}>
              {[
                { title: 'Total Queued', value: dashboardSummary.totalQueued, icon: <QueueIcon />, color: '#ffc107' }, // Yellow
                { title: 'Served', value: dashboardSummary.served, icon: <CheckCircleOutlineIcon />, color: '#28a745' }, // Green
                { title: 'Requeues', value: dashboardSummary.requeues, icon: <LoopIcon />, color: '#17a2b8' }, // Cyan
                { title: 'Cancelled', value: dashboardSummary.cancelled, icon: <CancelIcon />, color: '#dc3545' }, // Red
              ].map((card, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 200px', // Allows cards to wrap
                    minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 24px)' },
                    p: 3,
                    bgcolor: '#1f2a3a', // Darker background for cards
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
                  <Box sx={{ color: card.color, fontSize: '3rem', mb: 1 }}>
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

            {/* Queues Section */}
            <Box sx={{ p: 3, bgcolor: '#1f2a3a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
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
                <Button
                  variant="contained"
                  endIcon={<ArrowDropDownIcon />}
                  sx={{
                    bgcolor: '#333b4d',
                    color: '#e0e0e0',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4a5568' },
                  }}
                >
                  Select Counter
                </Button>
              </Box>

              {/* Queue Data Table */}
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
        // Prepare data for the pie chart
        { const chartData = [
          { name: 'Total Queued', value: queueHistorySummary.totalQueued },
          { name: 'PWD', value: queueHistorySummary.pwd },
          { name: 'Senior Citizens', value: queueHistorySummary.seniorCitizens },
          { name: 'Standard', value: queueHistorySummary.standard },
          { name: 'Cancelled', value: queueHistorySummary.cancelled },
        ].filter(data => data.value > 0); // Only include categories with values > 0

        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Queue History
            </Typography>

            {/* Date Pickers */}
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

            {/* Day/Week/Month/Year Tabs */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4, bgcolor: '#1f2a3a', borderRadius: '10px', p: 1 }}>
              {['Day', 'Week', 'Month', 'Year'].map((tab) => (
                <Button
                  key={tab}
                  variant="text"
                  sx={{
                    color: '#e0e0e0',
                    fontWeight: 600,
                    flex: 1,
                    py: 1.5,
                    borderRadius: '8px',
                    bgcolor: tab === 'Day' ? '#007bff' : 'transparent', // 'Day' is active by default
                    '&:hover': { bgcolor: tab === 'Day' ? '#0056b3' : '#333b4d' },
                  }}
                >
                  {tab}
                </Button>
              ))}
            </Box>

            {/* Summary Cards for Queue History */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 3, mb: 5 }}>
              {[
                { title: 'Total Queued', value: queueHistorySummary.totalQueued, icon: <QueueIcon />, color: '#ffc107' },
                { title: 'PWD', value: queueHistorySummary.pwd, icon: <WheelchairPickupIcon />, color: '#28a745' },
                { title: 'Senior Citizens', value: queueHistorySummary.seniorCitizens, icon: <ElderlyIcon />, color: '#17a2b8' },
                { title: 'Standard', value: queueHistorySummary.standard, icon: <PeopleIcon />, color: '#6f42c1' }, // Purple
                { title: 'Cancelled', value: queueHistorySummary.cancelled, icon: <CancelIcon />, color: '#dc3545' },
              ].map((card, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 180px', // Smaller flex basis for more cards
                    minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(20% - 24px)' },
                    p: 2.5,
                    bgcolor: '#1f2a3a',
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

            {/* Queue Breakdown Chart */}
            <Box sx={{ p: 3, bgcolor: '#1f2a3a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                    <Tooltip contentStyle={{ backgroundColor: '#333b4d', border: 'none', borderRadius: '8px', color: '#e0e0e0' }} />
                    <Legend wrapperStyle={{ color: '#e0e0e0' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: '#a0a0a0' }}>No data available for the chart.</Typography>
              )}
            </Box>
          </Box>
        ); }
      case 'Window Assigned':
        return (
          <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#f0f0f0', fontWeight: 600, mb: 4, textAlign: 'center' }}>
              WINDOWS ASSIGNED
            </Typography>

            {/* Add Staff Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.4)',
                  },
                }}
              >
                Add Staff
              </Button>
            </Box>

            {/* Window Assigned Data Table */}
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
                          <IconButton size="small" sx={{ color: '#17a2b8' }}><EditIcon fontSize="small" /></IconButton>
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
      default:
        return <Typography sx={{ p: 3, color: '#e0e0e0' }}>Select a page from the sidebar.</Typography>;
    }
  };

  const drawer = (
    <Box onClick={handleDrawerClose} sx={{ textAlign: 'center' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2, bgcolor: '#1a2430' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: '#007bff', mb: 1 }}>
          <AccountCircle sx={{ fontSize: 60 }} />
        </Avatar>
      </Toolbar>
      <Typography variant="h6" sx={{ color: '#e0e0e0', mt: 1 }}>{fullName}</Typography>
      <Typography variant="body2" sx={{ color: '#8ab4f8', mb: 2 }}>Administrator</Typography>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={currentPage === item.path}
              onClick={() => setCurrentPage(item.path)}
              sx={{
                py: 1.5,
                px: 3,
                '&.Mui-selected': {
                  bgcolor: '#007bff', // Active background
                  color: 'white',
                  borderRadius: '8px',
                  mx: 2,
                  '&:hover': { bgcolor: '#0056b3' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
                '&:hover': {
                  bgcolor: '#283747', // Hover background
                },
                '& .MuiListItemIcon-root': {
                  color: '#8ab4f8', // Icon color
                },
                '& .MuiListItemText-primary': {
                  color: '#e0e0e0', // Text color
                  fontWeight: 500,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 3,
              '&:hover': { bgcolor: '#dc3545', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
              '& .MuiListItemIcon-root': { color: '#dc3545' }, // Red for logout icon
              '& .MuiListItemText-primary': { color: '#e0e0e0', fontWeight: 500 },
            }}
          >
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1a2430', // Darker header
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure app bar is above drawer
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: '#8ab4f8' }} />
              <Typography variant="body1" sx={{ color: '#e0e0e0', fontWeight: 500 }}>{currentTime}</Typography>
              <EventIcon fontSize="small" sx={{ ml: 2, color: '#8ab4f8' }} />
              <Typography variant="body1" sx={{ color: '#e0e0e0', fontWeight: 500 }}>{currentDate}</Typography>
            </Box>
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowDropDownIcon />}
            sx={{
              bgcolor: '#333b4d',
              color: '#e0e0e0',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#4a5568' },
            }}
          >
            {branchName} {/* Display branch name here */}
          </Button>
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
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1a2430', color: '#e0e0e0' },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1a2430', color: '#e0e0e0' },
          }}
          open
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
          mt: { xs: '56px', sm: '64px' }, // Adjust content margin-top for app bar height
          bgcolor: '#1E1E2F', // NEW: Main content background
          minHeight: 'calc(100vh - 64px)', // Ensure content area fills remaining height
          overflowY: 'auto', // Enable scrolling for main content
        }}
      >
        {renderContent()}
      </Box>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Box className="modal-overlay">
          <Box className="logout-modal">
            <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 3 }}>
              Are you sure you want to log out?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={confirmLogout}
                sx={{
                  backgroundColor: '#28a745', // Green for Yes
                  '&:hover': { backgroundColor: '#218838' },
                }}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                onClick={cancelLogout}
                sx={{
                  backgroundColor: '#dc3545', // Red for No
                  '&:hover': { backgroundColor: '#c82333' },
                }}
              >
                No
              </Button>
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

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
  TableContainer, // Used for tables
  Table,           // Used for tables
  TableHead,       // Used for tables
  TableBody,       // Used for tables
  TableRow,        // Used for tables
  TableCell,       // Used for tables
  Paper,           // Used for tables
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import WindowIcon from '@mui/icons-material/Window';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
// import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QueueIcon from '@mui/icons-material/Queue';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoopIcon from '@mui/icons-material/Loop';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People'; // For Manage Staff
import BusinessIcon from '@mui/icons-material/Business'; // For Branches icon

import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// Recharts imports for the Pie Chart
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import './Dashboard.css';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios';

// Import forms
import AddStaffForm from './popup-forms/AddStaffForm';
import EditStaffForm from './popup-forms/EditStaffForm';
import AddWindowAndAssignmentForm from './popup-forms/AddWindowAndAssignmentForm';
import EditWindowAssignmentForm from './popup-forms/EditWindowAssignmentForm';
import DeleteWindowAssignmentConfirmation from './popup-forms/DeleteWindowAssignmentConfirmation';


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
  const [showAddWindowAndAssignmentModal, setShowAddWindowAndAssignmentModal] = useState(false);
  const [showEditWindowAssignmentModal, setShowEditWindowAssignmentModal] = useState(false);
  const [showDeleteWindowAssignmentModal, setShowDeleteWindowAssignmentModal] = useState(false);
  const [selectedWindowAssignment, setSelectedWindowAssignment] = useState(null);


  // States for all branches and staff (for dropdowns in forms)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // States for Queue Monitoring filters
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // Default to 'day'


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
      const mappedData = response.data.map(item => ({
        // Essential identifiers for actions
        windowId: item.windowId,
        assignmentId: item.assignmentId || null, // Optional: assignment ID
        staffId: item.staffId || null, // Staff ID from assignment or direct
        branchId: item.branchId, // Window's branch ID

        // Data to display
        windowNumber: item.windowNumber || 'N/A',
        windowName: item.windowName || 'N/A',
        staffName: item.staffName || 'Unassigned', // Safely access staff name
        totalQueued: item.totalQueued || 0, // Ensure this matches your backend's property name
        isActive: item.isActive, // Window's active status
      }));

      // --- FRONTEND DEBUGGING LOG START ---
      console.log('Frontend: Raw API Response for Windows Assigned:', JSON.stringify(response.data, null, 2));
      console.log('Frontend: Mapped Windows Assigned Data (before setState):', JSON.stringify(mappedData, null, 2));
      // --- FRONTEND DEBUGGING LOG END ---

      setWindowsAssignedData(mappedData);
    } catch (err) {
      console.error("Error fetching windows assigned data:", err);
      setError("Failed to load window assignments. Please check your backend's `/api/dashboard/windows-assigned` endpoint response structure.");
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
  const fetchStaffList = useCallback(async (branchId) => {
    setLoadingStaff(true);
    setError(null);
    try {
      if (!branchId || branchId === 'null' || branchId === 'undefined') {
        setStaffUsers([]);
        setLoadingStaff(false);
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/staff?branchId=${branchId}`);
      setStaffUsers(response.data.filter(staff => staff.isActive && staff.visibilityStatus === 'ON_LIVE'));
    } catch (err) {
      console.error("[fetchStaffList] Error fetching staff list:", err);
      setError("Failed to load staff list.");
      setStaffUsers([]);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  // Function to fetch all branches for dropdowns
  const fetchAllBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/branches`);
      setBranches(response.data);
    } catch (err) {
      console.error("Error fetching all branches:", err);
      setPopup({ type: 'error', message: 'Failed to load branch list for forms.' });
      setBranches([]);
    } finally {
      setLoadingBranches(false);
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

    if (!isLoggedIn || roleId !== "2") {
      showPopupMessage(setPopup, "error", "Access Denied. Please login as an Admin.");
      localStorage.clear();
      navigate('/Adminlogin', { replace: true });
      setLoading(false);
      return;
    }

    setFullName(storedFullName || 'Admin User');

    const isValidBranchId = storedBranchId && storedBranchId !== 'undefined' && storedBranchId !== 'null';

    fetchAllBranches();

    if (!isValidBranchId) {
        setBranchName('No Branch Assigned');
        setLoading(false);
        setError("No branch assigned to this admin. Data cannot be loaded.");
    } else {
        fetchBranchName(storedBranchId);
        fetchStaffList(storedBranchId);

        if (currentPage === 'Dashboard') {
            fetchDashboardSummary(storedBranchId);
            fetchQueuesData(storedBranchId);
        } else if (currentPage === 'Queue Monitoring') {
            fetchQueueHistoryData(storedBranchId, selectedPeriod, historyStartDate, historyEndDate);
        } else if (currentPage === 'Window Assigned') {
            fetchWindowsAssignedData(storedBranchId);
        } else if (currentPage === 'Manage Staff') {
            // Already fetched above
        }
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigate, currentPage, fetchDashboardSummary, fetchQueuesData, fetchWindowsAssignedData, fetchQueueHistoryData, fetchBranchName, fetchStaffList, fetchAllBranches, selectedPeriod, historyStartDate, historyEndDate]);


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
  const handleShowEditStaffModal = (staff) => {
    setSelectedStaffUser(staff);
    setShowEditStaffModal(true);
  };

  const handleCloseEditStaffModal = () => {
    setSelectedStaffUser(null);
    setShowEditStaffModal(false);
  };

  // Handlers for Add Window & Assignment Modal
  const handleShowAddWindowAndAssignmentModal = () => {
    setShowAddWindowAndAssignmentModal(true);
  };

  const handleCloseAddWindowAndAssignmentModal = () => {
    setShowAddWindowAndAssignmentModal(false);
  };

  // Handlers for Edit Window Assignment Modal
  const handleShowEditWindowAssignmentModal = (assignment) => {
    setSelectedWindowAssignment(assignment);
    setShowEditWindowAssignmentModal(true);
  };

  const handleCloseEditWindowAssignmentModal = () => {
    setSelectedWindowAssignment(null);
    setShowEditWindowAssignmentModal(false);
  };

  // Handlers for Delete Window Assignment Confirmation Modal
  const handleShowDeleteWindowAssignmentModal = (assignment) => {
    setSelectedWindowAssignment(assignment);
    setShowDeleteWindowAssignmentModal(true);
  };

  const handleCloseDeleteWindowAssignmentModal = () => {
    setSelectedWindowAssignment(null);
    setShowDeleteWindowAssignmentModal(false);
  };


  // Generic success/error handlers for staff/window operations
  const handleOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    const currentBranchId = localStorage.getItem("branchId");
    if (currentBranchId) {
      fetchStaffList(currentBranchId); // Refresh staff list
      fetchWindowsAssignedData(currentBranchId); // Refresh window assignments
      fetchQueueHistoryData(currentBranchId, selectedPeriod, historyStartDate, historyEndDate); // Refresh queue history
    }
  };

  const handleOperationError = (message) => {
    showPopupMessage(setPopup, "error", message);
  };

  // Handler for period buttons
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setHistoryStartDate(''); // Clear custom dates when a period is selected
    setHistoryEndDate('');
    // Data fetch will be triggered by useEffect due to selectedPeriod change
  };

  // Handler for custom date changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateFrom') {
      setHistoryStartDate(value);
      setSelectedPeriod(''); // Clear period selection when custom date is set
    } else if (name === 'dateTo') {
      setHistoryEndDate(value);
      setSelectedPeriod(''); // Clear period selection when custom date is set
    }
    // Data fetch will be triggered by useEffect due to historyStartDate/EndDate change
  };


  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#8ab4f8' }} />, path: 'Dashboard' },
    { text: 'Queue Monitoring', icon: <BarChartIcon sx={{ color: '#8ab4f8' }} />, path: 'Queue Monitoring' },
    { text: 'Window Assigned', icon: <WindowIcon sx={{ color: '#8ab4f8' }} />, path: 'Window Assigned' },
    { text: 'Manage Staff', icon: <PeopleIcon sx={{ color: '#8ab4f8' }} />, path: 'Manage Staff' },
  ];

  // const chartData = [
  //   { name: 'Total Queued', value: queueHistorySummary.totalQueued },
  //   { name: 'PWD', value: queueHistorySummary.pwd },
  //   { name: 'Senior Citizens', value: queueHistorySummary.seniorCitizens },
  //   { name: 'Standard', value: queueHistorySummary.standard },
  //   { name: 'Cancelled', value: queueHistorySummary.cancelled },
  // ].filter(data => data.value > 0);

  const chartData = [
    { name: 'Total Queued', value: dashboardSummary.totalQueued },
    { name: 'Served', value: dashboardSummary.served },
    { name: 'Requeues', value: dashboardSummary.requeues },
    { name: 'Cancelled', value: dashboardSummary.cancelled },
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
                fetchQueueHistoryData(currentBranchId, selectedPeriod, historyStartDate, historyEndDate); // Re-fetch
              } else if (currentPage === 'Window Assigned') {
                fetchWindowsAssignedData(currentBranchId);
              } else if (currentPage === 'Manage Staff') {
                fetchStaffList(currentBranchId);
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
                name="dateFrom" // Added name
                value={historyStartDate} // Connected to state
                onChange={handleDateChange} // Added handler
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
                name="dateTo" // Added name
                value={historyEndDate} // Connected to state
                onChange={handleDateChange} // Added handler
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
              {['day', 'week', 'month', 'year'].map((period) => ( // Changed to lowercase for consistency with backend
                <MuiButton
                  key={period}
                  variant="text"
                  onClick={() => handlePeriodChange(period)} // Added onClick handler
                  sx={{
                    color: '#e0e0e0',
                    fontWeight: 600,
                    flex: 1,
                    py: 1.5,
                    borderRadius: '8px',
                    bgcolor: selectedPeriod === period ? '#007bff' : 'transparent', // Highlight selected period
                    '&:hover': { bgcolor: selectedPeriod === period ? '#0056b3' : 'rgba(0, 123, 255, 0.1)' },
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)} {/* Display capitalized */}
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
                    <Tooltip contentStyle={{ backgroundColor: '#fbf9f9ff', border: 'none', borderRadius: '8px', color: '#e0e0e0' }} />
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
              <MuiButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleShowAddWindowAndAssignmentModal}
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
                Add Window & Assign Staff
              </MuiButton>
            </Box>

            {/* START: Updated Table Structure for Window Assigned */}
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
                <Table className="data-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Window Number</TableCell>
                      <TableCell>Window Name</TableCell>
                      <TableCell>Staff Assigned</TableCell>
                      <TableCell>Total Queued</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {windowsAssignedData.length > 0 ? (
                      windowsAssignedData.map((window) => (
                        <TableRow key={window.windowId}>
                          <TableCell data-label="Window Number">{window.windowNumber}</TableCell>
                          <TableCell data-label="Window Name">{window.windowName}</TableCell>
                          <TableCell data-label="Staff Assigned">{window.staffName}</TableCell>
                          <TableCell data-label="Total Queued">{window.totalQueued}</TableCell>
                          <TableCell data-label="Actions">
                            <IconButton
                              size="small"
                              sx={{ color: '#007bff' }}
                              onClick={() => handleShowEditWindowAssignmentModal(window)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: '#dc3545' }}
                              onClick={() => handleShowDeleteWindowAssignmentModal(window)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#a0a0a0' }}>
                          No window assignment data available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {/* END: Updated Table Structure for Window Assigned */}
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
                      {/* <TableCell>Staff ID</TableCell> */}
                      <TableCell>Full Name</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffUsers.length > 0 ? (
                      staffUsers.map((staff) => (
                        <TableRow key={staff.staffId}>
                          {/* <TableCell data-label="Staff ID">{staff.staffId}</TableCell> */}
                          <TableCell data-label="Full Name">{staff.fullName}</TableCell>
                          <TableCell data-label="Branch">{staff.branch?.branchName || 'N/A'}</TableCell>
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
                        <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#a0a0a0' }}>
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
          width: { sm: `calc(100% - ${drawerWidth}px - 710px)` },
          ml: { sm: `calc(${drawerWidth}px + 10px)` },
           backgroundColor: 'transparent !important',
          boxShadow: 'none',
          borderColor:'transparent !important',
          borderBottom: '1px solid rgba(100, 110, 130, 0)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '0 0 10px 10px',
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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center'}}>
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
              borderRadius: '0 15px 15px 0',
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
              borderRadius: '0 30px 30px 0',
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
          onStaffAdded={handleOperationSuccess}
          onStaffOperationError={handleOperationError}
          setPopup={setPopup}
          branches={branches}
          loadingBranches={loadingBranches}
          currentAdminBranchId={localStorage.getItem("branchId")}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && selectedStaffUser && (
        <EditStaffForm
          onClose={handleCloseEditStaffModal}
          userData={selectedStaffUser}
          onStaffUpdated={handleOperationSuccess}
          onStaffDeleted={handleOperationSuccess}
          onStaffOperationError={handleOperationError}
          setPopup={setPopup}
          branches={branches}
          loadingBranches={loadingBranches}
        />
      )}

      {/* Add Window & Assignment Modal */}
      {showAddWindowAndAssignmentModal && (
        <AddWindowAndAssignmentForm
          onClose={handleCloseAddWindowAndAssignmentModal}
          onOperationSuccess={handleOperationSuccess}
          onOperationError={handleOperationError}
          currentAdminBranchId={localStorage.getItem("branchId")}
          branches={branches}
          loadingBranches={loadingBranches}
          staffUsers={staffUsers}
          loadingStaff={loadingStaff}
        />
      )}

      {/* Edit Window Assignment Modal */}
      {showEditWindowAssignmentModal && selectedWindowAssignment && (
        <EditWindowAssignmentForm
          onClose={handleCloseEditWindowAssignmentModal}
          assignmentData={selectedWindowAssignment}
          onOperationSuccess={handleOperationSuccess}
          onOperationError={handleOperationError}
          branches={branches}
          loadingBranches={loadingBranches}
          staffUsers={staffUsers}
          loadingStaff={loadingStaff}
        />
      )}

      {/* Delete Window Assignment Confirmation Modal */}
      {showDeleteWindowAssignmentModal && selectedWindowAssignment && (
        <DeleteWindowAssignmentConfirmation
          onClose={handleCloseDeleteWindowAssignmentModal}
          assignmentData={selectedWindowAssignment}
          onOperationSuccess={handleOperationSuccess}
          onOperationError={handleOperationError}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Box className="modal-overlay">
          <Box className="logout-modal">
            <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 3 }}>
              Are you sure you want to log out?</Typography>
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

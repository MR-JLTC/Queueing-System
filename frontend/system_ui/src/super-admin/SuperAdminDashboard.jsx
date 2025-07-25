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
  CircularProgress, // Added for loading states
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group'; // For "Manage Users" icon
import BusinessIcon from '@mui/icons-material/Business'; // For "Manage Branches" icon
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import './SuperAdminDashboard.css';
import AddAdminForm from './popup-forms/AddAdminForm';
import EditAdminForm from './popup-forms/EditAdminForm';
import AddBranchForm from './popup-forms/AddBranchForm';
import EditBranchForm from './popup-forms/EditBranchForm';
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";
import axios from 'axios';

const drawerWidth = 240;
const API_BASE_URL = 'http://localhost:3000'; // Your backend URL

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
  const [currentView, setCurrentView] = useState('users');
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

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
          errorMessage += `Request setup error: ${error.message}`;
        }
      } else {
        errorMessage += `Unknown error: ${error.message}`;
      }
      showPopupMessage(setPopup, "error", errorMessage);
    } finally {
      setLoadingBranches(false);
    }
  }, [setPopup]);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const roleId = localStorage.getItem("roleId");
      const storedFullName = localStorage.getItem("fullName");

      if (!isLoggedIn || roleId !== "1") {
        console.warn("Unauthorized access. Redirecting to login.");
        navigate('/SuperAdminLogin', { replace: true });
      } else {
        setFullName(storedFullName || 'Super Admin');
        fetchAdminUsers();
        fetchBranches();
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
  }, [navigate, fetchAdminUsers, fetchBranches]);

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

  const handleAdminOperationError = (errorMessage) => {
    showPopupMessage(setPopup, "error", errorMessage);
  };

  const handleBranchOperationError = (errorMessage) => {
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

  const navItems = [
    { text: 'Manage Admins', icon: <GroupIcon sx={{ color: '#8ab4f8' }} />, view: 'users' },
    { text: 'Manage Branches', icon: <BusinessIcon sx={{ color: '#8ab4f8' }} />, view: 'branches' },
  ];

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
                py: 4,
                px: 5,
                // Apply border-radius to all items for consistent shape
                borderRadius: '3px 8px 8px 9px',
                marginBottom: '7px',
                // Conditional styling for selected state
                backgroundColor: currentView === item.view ? 'rgba(0, 123, 255, 0.15)' : 'transparent',
                borderLeft: currentView === item.view ? '4px solid #007bff' : '4px solid transparent',
                '&:hover': {
                  backgroundColor: currentView === item.view ? 'rgba(0, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '3px solid #007bff',
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

        {/* Conditional Rendering based on currentView */}
        {currentView === 'users' && (
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
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={30} sx={{ color: '#007bff' }} />
                        <Typography sx={{ mt: 2, color: '#e0e0e0' }}>Loading users...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
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
        )}

        {currentView === 'branches' && (
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
                  {loadingBranches ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={30} sx={{ color: '#007bff' }} />
                        <Typography sx={{ mt: 2, color: '#e0e0e0' }}>Loading branches...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : branches.length === 0 ? (
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
        )}

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

        {/* Popup Message Component */}
        {popup && (
          <PopupMessage
            type={popup.type}
            message={popup.message}
            onClose={() => setPopup(null)}
          />
        )}
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
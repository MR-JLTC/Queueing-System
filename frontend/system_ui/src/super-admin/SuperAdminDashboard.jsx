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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group'; // For "Manage Users" icon
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import './SuperAdminDashboard.css';
import AddAdminForm from './popup-forms/AddAdminForm';
import EditAdminForm from './popup-forms/EditAdminForm';
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

  // Function to fetch ONLY Admin users from backend (roleId: 2)
  const fetchAdminUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const allUsers = response.data;

      console.log("[SuperAdminDashboard] Raw users fetched from backend:", allUsers); // DEBUG: Log raw data

      const adminUsers = allUsers.filter(user => user.roleId === 2);

      const formattedUsers = adminUsers.map(user => {
        // IMPORTANT: Based on user.entity.ts, the primary key property is 'userId' (camelCase).
        // NestJS/TypeORM typically serialize entity properties to JSON.
        // So, we expect 'userId' from the backend's GET response.
        const userIdFromBackend = user.userId; // <--- CHANGED THIS LINE: user.userId (camelCase)

        const parsedId = Number(userIdFromBackend);

        if (isNaN(parsedId)) {
          console.error(`[SuperAdminDashboard] Invalid ID encountered: ${userIdFromBackend}. User object:`, user);
          // If you still see NaN, inspect the raw backend response in Network tab to find the correct ID field name.
          return null; // Filter out users with invalid IDs
        }

        return {
          id: parsedId,
          name: user.fullName,
          email: user.email,
          role: 'Admin', // Fixed as 'Admin' for this table
          status: user.isActive ? 'Active' : 'Inactive',
        };
      }).filter(Boolean); // Filter out any nulls if invalid IDs were skipped

      console.log("[SuperAdminDashboard] Formatted admin users for table:", formattedUsers); // DEBUG: Log formatted data
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error.response?.data || error.message);
      showPopupMessage(setPopup, "error", "Failed to load admin users. Please check backend connection.");
    }
  }, [setPopup]);

  // --- Authentication and Initial Data Fetch ---
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const roleId = localStorage.getItem("roleId");
      const storedFullName = localStorage.getItem("fullName");

      if (!isLoggedIn || roleId !== "1") { // Ensure only Super Admin (roleId 1) can access
        console.warn("Unauthorized access. Redirecting to login.");
        navigate('/login', { replace: true });
      } else {
        setFullName(storedFullName || 'Super Admin');
        fetchAdminUsers(); // Fetch admin users when Super Admin is authenticated
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
  }, [navigate, fetchAdminUsers]);

  // --- Modal Handlers ---
  const handleOpenAddAdminModal = () => setShowAddAdminModal(true);
  const handleCloseAddAdminModal = () => setShowAddAdminModal(false);

  const handleOpenEditAdminModal = (user) => {
    console.log("[SuperAdminDashboard] Opening Edit modal for user:", user); // DEBUG: Log user object passed
    setSelectedUser(user); // Pass the full user object including its ID
    setShowEditAdminModal(true);
  };
  const handleCloseEditAdminModal = () => {
    setSelectedUser(null);
    setShowEditAdminModal(false);
  };

  // --- Data Management Callbacks (trigger re-fetch after operation) ---
  const handleAdminOperationSuccess = (message) => {
    showPopupMessage(setPopup, "success", message);
    fetchAdminUsers(); // Re-fetch users after any successful operation
    handleCloseAddAdminModal(); // Close modals
    handleCloseEditAdminModal();
  };

  const handleAdminOperationError = (errorMessage) => {
    showPopupMessage(setPopup, "error", errorMessage);
  };

  // --- Drawer Handlers ---
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

  // --- Logout Function ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  // --- Sidebar Navigation Items ---
  const navItems = [
    { text: 'Manage Users', icon: <GroupIcon sx={{ color: '#8ab4f8' }} />, path: '/SuperAdminDashboard' },
  ];

  // --- Drawer Content (Sidebar) ---
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
        alignItems: 'center',
        gap: 1.5,
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid rgba(100, 110, 130, 0.1)',
      }}>
        <Avatar sx={{ bgcolor: '#007bff', width: 40, height: 40 }}>
          <AccountCircle sx={{ color: 'white', fontSize: '30px' }} />
        </Avatar>
        <Box>
          <Typography variant="body1" sx={{ color: '#e0e0e0', fontWeight: 600, fontSize: '1rem' }}>
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
              onClick={() => navigate(item.path)}
              selected={window.location.pathname === item.path}
              sx={{ py: 1.5, px: 3 }}
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
          <ListItemButton onClick={handleLogout} sx={{ py: 1.5, px: 3 }}>
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#1a1a1a',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(100, 110, 130, 0.1)',
          height: '64px',
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

        {/* Users Section Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#f0f0f0', fontWeight: 600, fontSize: '2.2rem' }}>
              Users
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              Manage the users
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
                <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Status</TableCell>
                <TableCell sx={{ color: '#8ab4f8', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(100, 110, 130, 0.1)', padding: '12px 16px' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <AddAdminForm
          onClose={handleCloseAddAdminModal}
          onAdminAdded={handleAdminOperationSuccess}
          onAdminOperationError={handleAdminOperationError}
          setPopup={setPopup}
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { userService } from '../services/api';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [emailSearch, setEmailSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: '',
    userName: '',
    email: '',
    password: '',
    roles: [],
    gender: true,
    level: 0,
    status: 'Active',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(currentPage + 1, rowsPerPage, emailSearch, roleFilter);
      setUsers(response.inforUsers || []);
      setTotalItems(response.totalItems || response.inforUsers?.length || 0);
      setTotalPages(response.totalPage || 0);
      setCurrentPage(response.curentPage ? response.curentPage - 1 : 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setSnackbar({ open: true, message: "Failed to fetch users", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage, emailSearch, roleFilter]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
    fetchUsers();
  };

  const handleEmailChange = (e) => {
    setEmailSearch(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser({
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        password: '',
        roles: user.roles || [],
        gender: user.gender,
        level: user.level,
        status: user.status || 'Active',
      });
      setIsEdit(true);
    } else {
      setCurrentUser({
        userId: '',
        userName: '',
        email: '',
        password: '',
        roles: ['User'],
        gender: true,
        level: 0,
        status: 'Active',
      });
      setIsEdit(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values to numbers
    if (name === 'level') {
      setCurrentUser({
        ...currentUser,
        [name]: value === '' ? '' : Number(value), // Allow empty string during typing
      });
    } else {
      setCurrentUser({
        ...currentUser,
        [name]: value,
      });
    }
  };

  const handleRoleChange = (e) => {
    setCurrentUser({
      ...currentUser,
      roles: Array.isArray(e.target.value) ? e.target.value : [e.target.value],
    });
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      if (isEdit) {
        await userService.updateUser(currentUser.userId, currentUser);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        // Check if we're registering an admin (by looking at roles)
        if (currentUser.roles.includes('Admin') && !isEdit) {
          // Use register-admin endpoint
          const adminData = {
            email: currentUser.email,
            password: currentUser.password || '',
            userName: currentUser.userName,
            gender: currentUser.gender,
            level: parseInt(currentUser.level, 10),
          };
          await userService.registerAdmin(adminData);
          setSnackbar({
            open: true,
            message: 'Admin user registered successfully',
            severity: 'success',
          });
        } else {
          // Use standard create user endpoint
          await userService.createUser(currentUser);
          setSnackbar({
            open: true,
            message: 'User created successfully',
            severity: 'success',
          });
        }
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving user:", err);
      setSnackbar({
        open: true,
        message: err.response?.data || 'Error saving user',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await userService.deleteUser(id);
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        setSnackbar({
          open: true,
          message: err.response?.data || 'Error deleting user',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewFlashcardSets = (userId) => {
    navigate(`/users/${userId}/flashcards`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      case 'Suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleChips = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return <Chip label="User" size="small" />;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {roles.map((role) => (
          <Chip 
            key={role} 
            label={role} 
            size="small"
            color={role === 'Admin' || role === 'SuperAdmin' ? 'primary' : 'default'}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Admin
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            placeholder="Search by email..."
            variant="outlined"
            size="small"
            value={emailSearch}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} size="small">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: '40%' }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Role"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Apply Filters
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchUsers}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow hover key={user.id}>
                        <TableCell>{user.id.substr(0, 8)}...</TableCell>
                        <TableCell>{user.userName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleChips(user.roles)}</TableCell>
                        <TableCell>{user.gender ? 'Male' : 'Female'}</TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Flashcard Sets">
                            <IconButton onClick={() => handleViewFlashcardSets(user.id)}>
                              <FilterListIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenDialog(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeleteUser(user.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={currentPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="dense"
              label="Username"
              name="userName"
              value={currentUser.userName}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              label="Email"
              name="email"
              type="email"
              value={currentUser.email}
              onChange={handleInputChange}
              required
            />
            {!isEdit && (
              <TextField
                fullWidth
                margin="dense"
                label="Password"
                name="password"
                type="password"
                value={currentUser.password}
                onChange={handleInputChange}
                required
                helperText="Password must include at least 1 uppercase letter, 1 special character, and 1 number"
              />
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                name="roles"
                value={currentUser.roles}
                label="Roles"
                onChange={handleRoleChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={currentUser.gender}
                label="Gender"
                onChange={handleInputChange}
              >
                <MenuItem value={true}>Male</MenuItem>
                <MenuItem value={false}>Female</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="dense"
              label="Level"
              name="level"
              type="number"
              value={currentUser.level}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users; 
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
  Visibility as ViewIcon, // Thay FilterListIcon thành ViewIcon cho rõ nghĩa hơn
} from '@mui/icons-material';
import { userService } from '../services/api'; // Đảm bảo đường dẫn đúng

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [page, setPage] = useState(0); // Xóa state không dùng
  const [currentPage, setCurrentPage] = useState(0); // State cho trang hiện tại (0-based index)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Bắt đầu với 10 hoặc 20 thay vì 1
  const [totalItems, setTotalItems] = useState(0); // State cho tổng số users
  // const [totalPages, setTotalPages] = useState(0); // Không cần thiết nếu có totalItems
  const [filters, setFilters] = useState({ email: '', role: '' }); // Gom filter vào một state object
  const [appliedFilters, setAppliedFilters] = useState({ email: '', role: '' }); // State lưu filter đã áp dụng
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Khởi tạo là null
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  // const [searchQuery, setSearchQuery] = useState(''); // Xóa state thừa

  // Function to fetch users from API
  const fetchUsers = async (pageIndex, pageSize, currentFilters) => {
    setLoading(true);
    setError(null); // Reset lỗi trước mỗi lần fetch
    try {
      // API yêu cầu page 1-based
      const apiPage = pageIndex + 1;
      const response = await userService.getAllUsers(
          apiPage,
          pageSize,
          currentFilters.email || null, // Gửi null nếu rỗng
          currentFilters.role || null   // Gửi null nếu rỗng
      );

      console.log("API Response:", response); // Kiểm tra response

      setUsers(response.inforUsers || []);

      // *** TÍNH TOÁN totalItems ***
      if (response.totalPage && response.itemPerPage) {
        // Tính toán nếu API không trả về totalItems trực tiếp
        const calculatedTotalItems = response.totalPage * response.itemPerPage;
        // Có thể cần điều chỉnh nếu trang cuối không đủ item, nhưng đây là ước tính tốt nhất
        setTotalItems(calculatedTotalItems);
         // Nếu API có trả về totalItems thì dùng nó: setTotalItems(response.totalItems || 0);
      } else {
         // Fallback nếu không có totalPage hoặc itemPerPage
         setTotalItems(response.inforUsers?.length || 0);
         // Hoặc nếu biết chắc là có totalItems thì dùng:
         // setTotalItems(response.totalItems || response.inforUsers?.length || 0);
      }


      // *** KHÔNG CẬP NHẬT currentPage Ở ĐÂY ***
      // setCurrentPage(response.curentPage ? response.curentPage - 1 : 0); // <--- XÓA DÒNG NÀY

    } catch (error) {
      console.error("Failed to fetch users:", error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Failed to fetch users";
      setError(errorMessage); // Hiển thị lỗi cụ thể hơn
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      setUsers([]); // Xóa dữ liệu cũ khi có lỗi
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect chỉ fetch khi trang, số dòng/trang, hoặc filter *đã áp dụng* thay đổi
  useEffect(() => {
    fetchUsers(currentPage, rowsPerPage, appliedFilters);
  }, [currentPage, rowsPerPage, appliedFilters]); // Chỉ fetch khi các state này thay đổi

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage); // Chỉ cần cập nhật state, useEffect sẽ xử lý việc fetch
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset về trang đầu khi thay đổi số dòng/trang
  };

  // Cập nhật state filter nháp khi người dùng nhập liệu
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý khi nhấn nút Apply Filters hoặc Enter
  const handleApplyFilters = () => {
    setCurrentPage(0); // Reset về trang đầu khi áp dụng filter mới
    setAppliedFilters(filters); // Cập nhật filter đã áp dụng, trigger useEffect
  };

  // Xử lý nhấn Enter trong ô tìm kiếm email
  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  // Reset filter và fetch lại
  const handleResetFilters = () => {
    setFilters({ email: '', role: '' });
    setCurrentPage(0);
    setAppliedFilters({ email: '', role: '' }); // Reset applied filters để trigger fetch
  };

  // Mở dialog thêm/sửa
  const handleOpenDialog = (user = null) => {
    if (user) {
      // Đảm bảo dùng đúng tên trường 'id' từ API
      setCurrentUser({
        id: user.id, // Dùng 'id'
        userName: user.userName || '',
        email: user.email || '',
        password: '', // Không hiển thị password cũ
        roles: user.roles || ['User'], // Mặc định là User nếu không có
        gender: user.gender === undefined ? true : user.gender, // Xử lý trường hợp undefined
        level: user.level || 0,
        // status: user.status || 'Active', // API response ví dụ không có status
      });
      setIsEdit(true);
    } else {
      // Reset form cho user mới
      setCurrentUser({
        id: '',
        userName: '',
        email: '',
        password: '',
        roles: ['User'], // Mặc định là User khi tạo mới
        gender: true, // Mặc định là Male
        level: 0,
        // status: 'Active',
      });
      setIsEdit(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null); // Reset currentUser khi đóng dialog
  };

  // Cập nhật state currentUser trong dialog
  const handleDialogInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: name === 'level' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleDialogRoleChange = (e) => {
    const { value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value, // Xử lý giá trị select multiple
    }));
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;

    // Simple validation example
    if (!currentUser.email || !currentUser.userName || (!isEdit && !currentUser.password)) {
        setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "warning" });
        return;
    }
     if (!isEdit && currentUser.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/.test(currentUser.password)) {
       setSnackbar({ open: true, message: "Password must be at least 6 chars, with 1 uppercase, 1 number, 1 special char.", severity: "warning" });
       return;
     }


    setLoading(true); // Có thể thêm loading state riêng cho dialog
    try {
      let message = '';
      // Chuẩn bị data gửi đi (chỉ gửi những trường cần thiết)
       const userData = {
           userName: currentUser.userName,
           email: currentUser.email,
           gender: currentUser.gender,
           level: parseInt(currentUser.level, 10) || 0,
           roles: currentUser.roles,
           // Chỉ gửi password khi tạo mới hoặc nếu muốn cho phép cập nhật password
           ...(isEdit ? {} : { password: currentUser.password }), // Chỉ gửi password khi tạo mới
       };

      if (isEdit) {
        // Khi update, thường chỉ cần gửi những trường thay đổi, hoặc toàn bộ trừ password
        // API của bạn cần endpoint update (ví dụ: updateUser(userId, data))
        await userService.updateUser(currentUser.id, userData); // Giả sử có hàm này
        message = 'User updated successfully';
      } else {
        // Khi tạo mới
        // Kiểm tra nếu tạo admin (ví dụ)
        if (currentUser.roles.includes('Admin') || currentUser.roles.includes('SuperAdmin')) {
           // API có thể cần endpoint riêng như registerAdmin
           // Hoặc endpoint createUser xử lý được việc gán role
           const adminData = { ...userData, password: currentUser.password };
           // await userService.registerAdmin(adminData); // Nếu có endpoint riêng
           await userService.createUser(adminData); // Nếu dùng endpoint chung
           message = 'Admin user created successfully';
        } else {
            const createData = { ...userData, password: currentUser.password };
            await userService.createUser(createData); // Dùng endpoint chung
            message = 'User created successfully';
        }
      }

      setSnackbar({ open: true, message: message, severity: 'success' });
      fetchUsers(currentPage, rowsPerPage, appliedFilters); // Fetch lại dữ liệu
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving user:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error saving user';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false); // Tắt loading dialog
    }
  };

  const handleDeleteUser = async (id) => {
    // Xác nhận trước khi xóa
    if (window.confirm(`Are you sure you want to delete user ${id.substring(0,8)}...? This action cannot be undone.`)) {
      setLoading(true); // Có thể dùng loading state riêng
      try {
        await userService.deleteUser(id); // Giả sử có hàm này
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        // Fetch lại trang hiện tại, hoặc về trang đầu nếu trang hiện tại trống sau khi xóa
        fetchUsers(currentPage, rowsPerPage, appliedFilters);
      } catch (err) {
        console.error("Error deleting user:", err);
        const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error deleting user';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Điều hướng sang trang xem chi tiết hoặc trang khác liên quan đến user
  const handleViewUserDetails = (userId) => {
     // navigate(`/admin/users/${userId}`); // Ví dụ đường dẫn chi tiết
     console.log("Navigate to details for user:", userId);
     // Hoặc mở một dialog chi tiết khác nếu không muốn chuyển trang
  };


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function để hiển thị roles
  const getRoleChips = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) {
      return <Chip label="User" size="small" variant="outlined" />;
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {roles.map((role) => (
          <Chip
            key={role}
            label={role}
            size="small"
            color={role === 'Admin' || role === 'SuperAdmin' ? 'primary' : 'secondary'}
            variant="filled"
          />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}> {/* Thêm padding chung */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading} // Disable nút khi đang loading
        >
          Add User
        </Button>
      </Box>

      {/* Thông báo lỗi tổng quát */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Phần Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by email..."
            variant="outlined"
            size="small"
            name="email" // Thêm name
            value={filters.email}
            onChange={handleFilterChange}
            onKeyPress={handleEmailKeyPress} // Xử lý Enter
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small"/>
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }} // Cho phép co giãn
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role" // Thêm name
              value={filters.role}
              onChange={handleFilterChange}
              label="Role"
            >
              <MenuItem value="">
                <em>All Roles</em>
              </MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
              {/* Thêm các role khác nếu có */}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            onClick={handleApplyFilters} // Gọi hàm áp dụng filter
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetFilters}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* Bảng dữ liệu */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}> {/* Thêm overflow */}
        <TableContainer>
          <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="small">
            <TableHead>
              <TableRow>
                {/* Có thể thêm sort nếu API hỗ trợ */}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography>No users found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow hover key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                       <Tooltip title={user.id}>
                          <span>{user.id.substring(0, 8)}...</span>
                       </Tooltip>
                    </TableCell>
                    <TableCell>{user.userName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleChips(user.roles)}</TableCell>
                    <TableCell>{user.gender ? 'Male' : 'Female'}</TableCell>
                    <TableCell>{user.level}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        {/* Đổi icon và hành động nếu cần */}
                        <IconButton size="small" onClick={() => handleViewUserDetails(user.id)} color="default">
                          <ViewIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton size="small" onClick={() => handleOpenDialog(user)} color="primary">
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        {/* Disable nút xóa nếu user là SuperAdmin chẳng hạn */}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          color="error"
                          // disabled={user.roles?.includes('SuperAdmin')}
                        >
                          <DeleteIcon fontSize="inherit"/>
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Chỉ hiển thị Pagination nếu có dữ liệu và không loading */}
        {totalItems > 0 && !loading && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]} // Điều chỉnh options nếu cần
            component="div"
            count={totalItems} // Sử dụng totalItems đã tính toán/lấy về
            rowsPerPage={rowsPerPage}
            page={currentPage} // Sử dụng currentPage (0-based index)
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            // Thêm label để rõ ràng hơn, đặc biệt khi count là ước tính
             labelDisplayedRows={({ from, to, count }) =>
                 // Nếu count là tính toán từ totalPages, có thể ghi chú
                 `${from}–${to} of ${count}` // Giữ nguyên nếu API trả về totalItems chính xác
                 // `${from}–${to} of approx. ${count}` // Nếu count là ước tính
             }
          />
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          {/* Chỉ render form khi currentUser có giá trị */}
          {currentUser && (
            <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Username"
                name="userName"
                value={currentUser.userName}
                onChange={handleDialogInputChange}
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                name="email"
                type="email"
                value={currentUser.email}
                onChange={handleDialogInputChange}
                required
                variant="outlined"
                // disabled={isEdit} // Có thể không cho sửa email
              />
              {/* Chỉ hiển thị password khi tạo mới */}
              {!isEdit && (
                <TextField
                  fullWidth
                  margin="dense"
                  label="Password"
                  name="password"
                  type="password"
                  value={currentUser.password}
                  onChange={handleDialogInputChange}
                  required={!isEdit} // Bắt buộc khi tạo mới
                  variant="outlined"
                  helperText="Min 6 chars, 1 uppercase, 1 number, 1 special char (!@#$%^&*)"
                />
              )}
               <FormControl fullWidth margin="dense" variant="outlined">
                 <InputLabel>Roles</InputLabel>
                 <Select
                   multiple
                   name="roles"
                   value={currentUser.roles}
                   label="Roles"
                   onChange={handleDialogRoleChange}
                   renderValue={(selected) => (
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                       {(selected || []).map((value) => ( // Xử lý selected có thể là null/undefined
                         <Chip key={value} label={value} size="small" />
                       ))}
                     </Box>
                   )}
                 >
                   {/* Có thể lấy danh sách role từ API */}
                   <MenuItem value="User">User</MenuItem>
                   <MenuItem value="Admin">Admin</MenuItem>
                   <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
                 </Select>
               </FormControl>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={currentUser.gender}
                  label="Gender"
                  onChange={handleDialogInputChange}
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
                onChange={handleDialogInputChange}
                InputProps={{ inputProps: { min: 0 } }}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}> {/* Thêm padding */}
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={loading} // Disable khi đang lưu
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000} // Giảm thời gian một chút
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled" // Dùng filled cho nổi bật
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
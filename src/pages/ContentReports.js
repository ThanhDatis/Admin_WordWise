import React, { useState, useEffect } from 'react';
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
  Grid,
  Card,
  CardContent,
  CardActions,
  TableSortLabel,
  Snackbar,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { reportService, userService } from '../services/api';

// Enum for content types
const ContentTypeReport = {
  FLASHCARD_SET: 1,
  FLASHCARD: 2,
  LESSON: 3,
  COMMENT: 4,
};

// Enum for report status
const ReportStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
};

// Convert content type enum to readable string
const getContentTypeLabel = (type) => {
  switch (type) {
    case ContentTypeReport.FLASHCARD_SET:
      return 'Flashcard Set';
    case ContentTypeReport.FLASHCARD:
      return 'Flashcard';
    case ContentTypeReport.LESSON:
      return 'Lesson';
    case ContentTypeReport.COMMENT:
      return 'Comment';
    default:
      return 'Unknown';
  }
};

// Convert status enum to readable string and color
const getStatusInfo = (status) => {
  switch (status) {
    case ReportStatus.PENDING:
      return { label: 'Pending', color: 'warning' };
    case ReportStatus.APPROVED:
      return { label: 'Approved', color: 'success' };
    case ReportStatus.REJECTED:
      return { label: 'Rejected', color: 'error' };
    default:
      return { label: 'Unknown', color: 'default' };
  }
};

const ContentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    contentType: '',
    status: '',
    sortBy: 'CreateAt',
    isDesc: true,
  });
  
  // Open filters
  const [openFilters, setOpenFilters] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getAllReports({
        ...filters,
        currentPage: page + 1, // API uses 1-based indexing
        itemPerPage: rowsPerPage,
      });
      
      setReports(response.contentReports);
      setTotalItems(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0); // Reset to first page when changing filters
  };

  const handleSortChange = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      isDesc: prev.sortBy === field ? !prev.isDesc : true,
    }));
    setPage(0);
  };

  const handleViewReport = async (reportId) => {
    try {
      setLoading(true);
      const report = await reportService.getReportById(reportId);
      setSelectedReport(report);
      setOpenReportDialog(true);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError(err.response?.data || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setSelectedReport(null);
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      setProcessing(true);
      const response = await reportService.updateReportStatus(reportId, newStatus);
      
      // Update the local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.reportId === reportId ? { ...report, status: newStatus } : report
        )
      );
      
      // If we're viewing a report, update its status
      if (selectedReport && selectedReport.reportId === reportId) {
        setSelectedReport((prev) => ({ ...prev, status: newStatus }));
      }
      
      // Show success notification
      setSnackbar({
        open: true,
        message: response || 'Set status report successfully.',
        severity: 'success',
      });
      
      // Close the dialog if open
      if (openReportDialog) {
        handleCloseReportDialog();
      }
      
      // Refresh the data
      fetchReports();
    } catch (err) {
      console.error('Error updating report status:', err);
      
      let errorMessage;
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid report status value.';
            break;
          case 404:
            errorMessage = 'Report not found.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 401:
            errorMessage = 'Authentication required. Please login again.';
            break;
          default:
            errorMessage = err.response.data || 'Failed to update report status.';
        }
      } else {
        errorMessage = 'Network error. Please try again.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      userId: '',
      contentType: '',
      status: '',
      sortBy: 'CreateAt',
      isDesc: true,
    });
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Content Reports Management</Typography>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setOpenFilters(!openFilters)}
        >
          Filters
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      {openFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="User ID"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Content Type</InputLabel>
                <Select
                  name="contentType"
                  value={filters.contentType}
                  label="Content Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value={ContentTypeReport.FLASHCARD_SET}>Flashcard Set</MenuItem>
                  <MenuItem value={ContentTypeReport.FLASHCARD}>Flashcard</MenuItem>
                  <MenuItem value={ContentTypeReport.LESSON}>Lesson</MenuItem>
                  <MenuItem value={ContentTypeReport.COMMENT}>Comment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={ReportStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={ReportStatus.APPROVED}>Approved</MenuItem>
                  <MenuItem value={ReportStatus.REJECTED}>Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={fetchReports}
                  disabled={loading}
                >
                  Apply
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={resetFilters}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">No reports found.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'ReportId'}
                        direction={filters.isDesc ? 'desc' : 'asc'}
                        onClick={() => handleSortChange('ReportId')}
                      >
                        Report ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'UserId'}
                        direction={filters.isDesc ? 'desc' : 'asc'}
                        onClick={() => handleSortChange('UserId')}
                      >
                        Reported By
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Content ID</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'ContentType'}
                        direction={filters.isDesc ? 'desc' : 'asc'}
                        onClick={() => handleSortChange('ContentType')}
                      >
                        Content Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'Status'}
                        direction={filters.isDesc ? 'desc' : 'asc'}
                        onClick={() => handleSortChange('Status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'CreateAt'}
                        direction={filters.isDesc ? 'desc' : 'asc'}
                        onClick={() => handleSortChange('CreateAt')}
                      >
                        Created At
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => {
                    const statusInfo = getStatusInfo(report.status);
                    return (
                      <TableRow hover key={report.reportId}>
                        <TableCell>{report.reportId.substring(0, 8)}...</TableCell>
                        <TableCell>{report.userId}</TableCell>
                        <TableCell>{report.contentId.substring(0, 8)}...</TableCell>
                        <TableCell>{getContentTypeLabel(report.contentType)}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {report.reason}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(report.createAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleViewReport(report.reportId)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {report.status === ReportStatus.PENDING && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton 
                                  color="success"
                                  onClick={() => handleUpdateReportStatus(report.reportId, ReportStatus.APPROVED)}
                                  disabled={processing}
                                >
                                  <ApproveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton 
                                  color="error"
                                  onClick={() => handleUpdateReportStatus(report.reportId, ReportStatus.REJECTED)}
                                  disabled={processing}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Report Details Dialog */}
      <Dialog
        open={openReportDialog}
        onClose={handleCloseReportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">Report ID</Typography>
                <Typography variant="body1" gutterBottom>{selectedReport.reportId}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Reported By</Typography>
                <Typography variant="body1" gutterBottom>{selectedReport.userId}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Content Type</Typography>
                <Typography variant="body1" gutterBottom>{getContentTypeLabel(selectedReport.contentType)}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Content ID</Typography>
                <Typography variant="body1" gutterBottom>{selectedReport.contentId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
                <Chip
                  label={getStatusInfo(selectedReport.status).label}
                  color={getStatusInfo(selectedReport.status).color}
                  sx={{ mb: 1 }}
                />
                
                <Typography variant="subtitle1" fontWeight="bold">Created At</Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedReport.createAt).toLocaleString()}
                </Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Reason</Typography>
                <Typography variant="body1" gutterBottom>{selectedReport.reason}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReport.description}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedReport && selectedReport.status === ReportStatus.PENDING && (
            <>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleUpdateReportStatus(selectedReport.reportId, ReportStatus.APPROVED)}
                disabled={processing}
              >
                Approve
              </Button>
              <Button 
                variant="contained" 
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleUpdateReportStatus(selectedReport.reportId, ReportStatus.REJECTED)}
                disabled={processing}
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={handleCloseReportDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContentReports; 
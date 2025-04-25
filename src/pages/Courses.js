import React, { useState, useEffect } from 'react';
// *** THAY ĐỔI: Import đúng service ***
import { flashCardService } from '../services/api';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    // CardMedia, // Có thể giữ lại nếu API trả về ảnh
    CardActions,
    Button,
    Chip,
    // Dialog, DialogTitle, DialogContent, DialogActions, // Tạm thời bỏ qua Add/Edit
    TextField,
    // *** Thêm component cho filter ***
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    // Rating, // Không dùng Rating
    InputAdornment,
    // Divider, // Có thể dùng hoặc bỏ
    // Fab, // Tạm thời bỏ qua Add/Edit
    CircularProgress, // Thêm loading
    Alert,          // Thêm error
    Paper,          // Thêm cho khu vực filter
    TablePagination, // Thêm pagination
    Tooltip,         // Thêm tooltip
} from '@mui/material';
import {
    // Add as AddIcon, // Tạm thời bỏ qua Add/Edit
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Language as LanguageIcon,
    // AccessTime as AccessTimeIcon, // Thay bằng icon khác nếu cần
    // Star as StarIcon, // Không dùng Rating
    Visibility as VisibilityIcon, // Icon xem chi tiết/vocab
    LibraryBooks as LibraryBooksIcon, // Icon cho số từ vựng
    PeopleAlt as PeopleAltIcon,    // Icon cho số người học
    CalendarToday as CalendarTodayIcon, // Icon ngày tạo
    Info as InfoIcon, // Icon cho Level
    Refresh as RefreshIcon, // Icon refresh
    FilterList as FilterListIcon, // Icon filter
} from '@mui/icons-material';
import { format } from 'date-fns'; // Import date-fns

// Giả sử có danh sách ngôn ngữ
const LANGUAGES = [
    { code: 'ENG', name: 'English' },
    { code: 'VIE', name: 'Vietnamese' },
    { code: 'FRA', name: 'French' },
    { code: 'ESP', name: 'Spanish' },
    // Thêm các ngôn ngữ khác
];

// Component đã được đổi tên
const FlashcardSetsAdmin = () => {
    // *** State quản lý dữ liệu từ API ***
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0, // MUI dùng 0-based
        rowsPerPage: 12, // Số card trên trang
        totalItems: 0,
        totalPages: 0,
    });
    // State cho filter UI
    const [filters, setFilters] = useState({
        flashCardSetId: '',
        title: '', // Giữ lại search theo title nếu cần
        learningLanguage: '',
        nativeLanguage: '',
    });
    // State cho filter đã áp dụng
    const [appliedFilters, setAppliedFilters] = useState({ ...filters });
    const [showFilters, setShowFilters] = useState(false);

    // Hàm gọi API
    const fetchFlashcardSets = async (page, limit, currentAppliedFilters) => {
        setLoading(true);
        setError(null);
        try {
            const apiPage = page + 1;
            const params = {
                page: apiPage,
                itemPerPage: limit,
                flashCardSetId: currentAppliedFilters.flashCardSetId || null,
                learningLanguage: currentAppliedFilters.learningLanguage || null,
                nativeLanguage: currentAppliedFilters.nativeLanguage || null,
                // title: currentAppliedFilters.title || null, // Nếu API hỗ trợ search title
            };

            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });

            console.log("Calling FlashcardSet API with params:", params);
            const response = await flashCardService.getAllFlashcardSetsAdmin(params);
            console.log("API Response FlashcardSets:", response);

            // *** API response không có trường cụ thể cho sets, giả sử nó là mảng gốc hoặc trong 1 key khác ***
            // Kiểm tra cấu trúc response thực tế và điều chỉnh nếu cần
            const setsData = response.flashcardSets || response.data || (Array.isArray(response) ? response : []) || [];
            setFlashcardSets(setsData);

            const totalItemsCalc = (response.totalPage || 0) * (response.itemPerPage || limit);
            setPagination({
                currentPage: response.curentPage ? response.curentPage - 1 : 0,
                rowsPerPage: response.itemPerPage || limit,
                totalItems: totalItemsCalc,
                totalPages: response.totalPage || 0,
            });

        } catch (err) {
            console.error("Failed to fetch flashcard sets:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to load flashcard sets.";
            setError(errorMessage);
            setFlashcardSets([]);
            setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 0, currentPage: 0 }));
        } finally {
            setLoading(false);
        }
    };

    // useEffect gọi API
    useEffect(() => {
        fetchFlashcardSets(pagination.currentPage, pagination.rowsPerPage, appliedFilters);
    }, [pagination.currentPage, pagination.rowsPerPage, appliedFilters]);

    // --- Handler Functions ---
    const handleChangePage = (event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setPagination(prev => ({
            ...prev,
            rowsPerPage: newRowsPerPage,
            currentPage: 0,
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        setPagination(prev => ({ ...prev, currentPage: 0 }));
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        const initialFilters = {
            flashCardSetId: '',
            title: '',
            learningLanguage: '',
            nativeLanguage: '',
        };
        setFilters(initialFilters);
        setPagination(prev => ({ ...prev, currentPage: 0 }));
        setAppliedFilters(initialFilters);
        setShowFilters(false);
    };

    const handleRefresh = () => {
        fetchFlashcardSets(pagination.currentPage, pagination.rowsPerPage, appliedFilters);
    };

    // Placeholder handlers for actions
    const handleEditSet = (setId) => {
        console.log("Edit set:", setId);
    };

    const handleDeleteSet = (setId) => {
        console.log("Delete set:", setId);
        if (window.confirm(`Are you sure you want to delete set ${setId.substring(0, 8)}...?`)) {
            // Call delete API
        }
    };

    const handleViewVocabularies = (setId) => {
        console.log("View vocabularies for set:", setId);
        // Navigate to vocabulary page or open modal
    };
    // --- Kết thúc Handlers ---

    return (
        <Box sx={{ p: 2 }}>
            {/* *** THAY ĐỔI: Tiêu đề *** */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">Flashcard Set Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant={showFilters ? "contained" : "outlined"}
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                    {/* <Button variant="contained" startIcon={<AddIcon />} disabled> Add Set </Button> */}
                </Box>
            </Box>

            {/* Khu vực Filter */}
             {showFilters && (
                 <Paper sx={{ p: 2, mb: 2 }}>
                     <Grid container spacing={2} alignItems="center">
                         {/* <Grid item xs={12} sm={6} md={4}>
                             <TextField
                                 label="Search by Title"
                                 name="title"
                                 variant="outlined" size="small" fullWidth
                                 value={filters.title} onChange={handleFilterChange}
                             />
                         </Grid> */}
                         <Grid item xs={12} sm={6} md={4}>
                             <TextField
                                 label="Filter by Set ID"
                                 name="flashCardSetId"
                                 variant="outlined" size="small" fullWidth
                                 value={filters.flashCardSetId} onChange={handleFilterChange}
                             />
                         </Grid>
                         <Grid item xs={12} sm={8} md={6}>
                            <FormControl fullWidth size="medium" variant="outlined">
                                <InputLabel>Learning Language</InputLabel>
                                <Select
                                    name="learningLanguage"
                                    value={filters.learningLanguage}
                                    label="Learning Language"
                                    onChange={handleFilterChange}
                                    style={{ minWidth: '250px' }} // Điều chỉnh độ rộng tối thiểu
                                >
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {LANGUAGES.map(lang => (
                                        <MenuItem key={lang.code} value={lang.code}>
                                            {lang.name} ({lang.code})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Filter theo Native Language */}
                        <Grid item xs={12} sm={8} md={6}>
                            <FormControl fullWidth size="medium" variant="outlined">
                                <InputLabel>Native Language</InputLabel>
                                <Select
                                    name="nativeLanguage"
                                    value={filters.nativeLanguage}
                                    label="Native Language"
                                    onChange={handleFilterChange}
                                    style={{ minWidth: '250px' }} // Điều chỉnh độ rộng tối thiểu
                                >
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {LANGUAGES.map(lang => (
                                        <MenuItem key={lang.code} value={lang.code}>
                                            {lang.name} ({lang.code})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', gap: 1 }}>
                             <Button variant="contained" onClick={handleApplyFilters} startIcon={<SearchIcon />} disabled={loading} fullWidth> Apply Filters </Button>
                             <Button variant="outlined" onClick={handleResetFilters} disabled={loading} fullWidth> Reset </Button>
                         </Grid>
                     </Grid>
                 </Paper>
             )}

            {/* Hiển thị lỗi */}
            {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Hiển thị loading */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Grid hiển thị Flashcard Sets */}
            {!loading && !error && (
                <>
                    {flashcardSets.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                             <Typography variant="h6" color="text.secondary">
                                 {Object.values(appliedFilters).some(v => v)
                                     ? "No flashcard sets found matching your filters."
                                     : "No flashcard sets found."}
                             </Typography>
                         </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* *** THAY ĐỔI: Map qua flashcardSets state *** */}
                            {flashcardSets.map((set) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={set.flashcardSetId}>
                                    {/* *** THAY ĐỔI: Sử dụng dữ liệu từ set object *** */}
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {/* <CardMedia component="img" height="140" image={set.image || defaultImage} alt={set.title} /> */}
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Tooltip title={set.flashcardSetId}>
                                                 <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                                     ID: {set.flashcardSetId.substring(0, 8)}...
                                                 </Typography>
                                             </Tooltip>
                                            <Typography variant="h6" gutterBottom component="div" sx={{ mt: 1 }}>
                                                {set.title || "Untitled Set"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                {set.description || "No description available."}
                                            </Typography>

                                            {/* Thông tin khác */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                                                <LanguageIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                <Chip label={`${set.learningLanguage || '?'} → ${set.nativeLanguage || '?'}`} size="small" variant="outlined" />
                                             </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                                                 <LibraryBooksIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                 <Typography variant="body2" color="text.secondary">
                                                     {set.totalVocabulary ?? 0} cards
                                                 </Typography>
                                             </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                                                <PeopleAltIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {set.learnerCount ?? 0} learners
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                                                 <InfoIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                 <Typography variant="body2" color="text.secondary">
                                                     Level: {set.level ?? 'N/A'}
                                                 </Typography>
                                             </Box>
                                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                                                 <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                 <Typography variant="body2" color="text.secondary">
                                                     Created: {set.createdAt ? format(new Date(set.createdAt), 'dd/MM/yyyy') : 'N/A'}
                                                 </Typography>
                                             </Box>
                                             {/* Có thể thêm trạng thái Public/Private nếu API trả về */}
                                        </CardContent>
                                        <CardActions sx={{ mt: 'auto', borderTop: '1px solid #eee', p: 1 }}>
                                            {/* *** Cập nhật Actions *** */}
                                            <Tooltip title="View Vocabularies">
                                                 <IconButton size="small" onClick={() => handleViewVocabularies(set.flashcardSetId)} color="default">
                                                     <VisibilityIcon fontSize="inherit" />
                                                 </IconButton>
                                             </Tooltip>
                                            <Tooltip title="Edit Set">
                                                 <IconButton size="small" onClick={() => handleEditSet(set.flashcardSetId)} color="primary">
                                                     <EditIcon fontSize="inherit" />
                                                 </IconButton>
                                             </Tooltip>
                                            <Tooltip title="Delete Set">
                                                 <IconButton size="small" onClick={() => handleDeleteSet(set.flashcardSetId)} color="error">
                                                     <DeleteIcon fontSize="inherit"/>
                                                 </IconButton>
                                             </Tooltip>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* *** Thêm Pagination *** */}
                     {pagination.totalItems > 0 && (
                         <TablePagination
                             component="div"
                             count={pagination.totalItems}
                             page={pagination.currentPage}
                             rowsPerPage={pagination.rowsPerPage}
                             onPageChange={handleChangePage}
                             onRowsPerPageChange={handleChangeRowsPerPage}
                             rowsPerPageOptions={[12, 24, 48, 96]} // Các tùy chọn số lượng card/trang
                             sx={{ mt: 3, borderTop: '1px solid #eee', pt: 1 }}
                             labelDisplayedRows={({ from, to, count }) =>
                                 `${from}–${to} of approx. ${count}` // Ghi chú count là ước tính
                             }
                         />
                     )}
                </>
            )}

            {/* Dialog Add/Edit (tạm thời bỏ) */}
            {/* <Dialog open={openDialog} onClose={handleCloseDialog} ...> ... </Dialog> */}

            {/* FAB Add (tạm thời bỏ) */}
            {/* <Fab color="primary" ... > <AddIcon /> </Fab> */}
        </Box>
    );
};

export default FlashcardSetsAdmin; // Đổi tên export
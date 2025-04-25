import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Grid,
  Chip,
  Tooltip,
  InputAdornment,
  Collapse,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

// Dummy data for lessons
const generateLessons = () => {
  const types = ['Video', 'Quiz', 'Exercise', 'Audio', 'Reading'];
  const courseNames = [
    'Spanish for Beginners',
    'Business English',
    'French Conversation',
    'Japanese Fundamentals',
    'German Grammar',
    'Chinese Characters',
    'Italian for Travelers',
    'Russian Pronunciation',
  ];
  
  const lessons = [];
  let lessonId = 1;
  
  for (let courseId = 1; courseId <= 8; courseId++) {
    const courseName = courseNames[courseId - 1];
    const lessonCount = Math.floor(Math.random() * 8) + 3; // 3-10 lessons per course
    
    for (let i = 1; i <= lessonCount; i++) {
      const lessonType = types[Math.floor(Math.random() * types.length)];
      const duration = lessonType === 'Quiz' || lessonType === 'Exercise' 
        ? `${Math.floor(Math.random() * 15) + 5} questions`
        : `${Math.floor(Math.random() * 20) + 5} mins`;
      
      lessons.push({
        id: lessonId++,
        title: `Lesson ${i}: ${getRandomLessonTitle(courseName, i, lessonType)}`,
        courseId,
        courseName,
        type: lessonType,
        duration,
        order: i,
        isPublished: Math.random() > 0.2, // 80% chance to be published
        completionRate: Math.floor(Math.random() * 100),
        description: `This ${lessonType.toLowerCase()} lesson focuses on important concepts in ${courseName.toLowerCase()}.`,
        content: lessonType === 'Video' ? 'https://example.com/video.mp4' : 
                 lessonType === 'Audio' ? 'https://example.com/audio.mp3' : 
                 'Lesson content goes here...',
      });
    }
  }
  
  return lessons;
};

// Helper function to generate random lesson titles
const getRandomLessonTitle = (courseName, lessonNumber, lessonType) => {
  const language = courseName.split(' ')[0];
  
  const videoTitles = [
    `Introduction to ${language} Vocabulary`,
    `${language} Grammar Basics`,
    `${language} Conversation Practice`,
    `${language} Pronunciation Guide`,
    `Advanced ${language} Concepts`,
  ];
  
  const quizTitles = [
    `${language} Vocabulary Quiz`,
    `${language} Grammar Test`,
    `${language} Comprehension Check`,
    `${language} Listening Quiz`,
    `${language} Knowledge Assessment`,
  ];
  
  const exerciseTitles = [
    `${language} Writing Exercise`,
    `${language} Speaking Practice`,
    `${language} Translation Exercise`,
    `${language} Grammar Drills`,
    `${language} Vocabulary Practice`,
  ];
  
  const audioTitles = [
    `${language} Listening Practice`,
    `${language} Pronunciation Audio`,
    `${language} Conversation Audio`,
    `${language} Native Speaker Dialogues`,
    `${language} Audio Dictation`,
  ];
  
  const readingTitles = [
    `${language} Reading Passage`,
    `${language} Cultural Text`,
    `${language} Story Reading`,
    `${language} Article Analysis`,
    `${language} Comprehension Text`,
  ];
  
  switch (lessonType) {
    case 'Video':
      return videoTitles[lessonNumber % videoTitles.length];
    case 'Quiz':
      return quizTitles[lessonNumber % quizTitles.length];
    case 'Exercise':
      return exerciseTitles[lessonNumber % exerciseTitles.length];
    case 'Audio':
      return audioTitles[lessonNumber % audioTitles.length];
    case 'Reading':
      return readingTitles[lessonNumber % readingTitles.length];
    default:
      return `${language} Lesson`;
  }
};

const initialLessons = generateLessons();

// Row component with expandable details
function LessonRow({ lesson, handleEditLesson, handleDeleteLesson }) {
  const [open, setOpen] = useState(false);
  
  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{lesson.id}</TableCell>
        <TableCell>{lesson.title}</TableCell>
        <TableCell>{lesson.courseName}</TableCell>
        <TableCell>
          <Chip 
            label={lesson.type} 
            size="small"
            color={
              lesson.type === 'Video' ? 'primary' :
              lesson.type === 'Quiz' ? 'secondary' :
              lesson.type === 'Exercise' ? 'success' :
              lesson.type === 'Audio' ? 'info' : 'warning'
            }
          />
        </TableCell>
        <TableCell>{lesson.duration}</TableCell>
        <TableCell>{lesson.order}</TableCell>
        <TableCell>
          <Chip 
            label={lesson.isPublished ? 'Published' : 'Draft'} 
            color={lesson.isPublished ? 'success' : 'default'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditLesson(lesson)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteLesson(lesson.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Card variant="outlined" sx={{ m: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lesson Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography variant="body2" paragraph>
                      {lesson.description}
                    </Typography>
                    
                    <Typography variant="subtitle2">Content Link/Preview:</Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {lesson.content}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Course: {lesson.courseName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Duration: {lesson.duration}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Completion Rate: {lesson.completionRate}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const Lessons = () => {
  const [lessons, setLessons] = useState(initialLessons);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLesson, setCurrentLesson] = useState({
    id: '',
    title: '',
    courseId: 1,
    courseName: '',
    type: 'Video',
    duration: '',
    order: 1,
    isPublished: true,
    description: '',
    content: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Get unique course names for filter
  const courseOptions = [...new Set(lessons.map((lesson) => lesson.courseName))];
  
  // Filter lessons based on search term and filters
  const filteredLessons = lessons.filter(
    (lesson) => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lesson.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourseFilter = filterCourse ? lesson.courseName === filterCourse : true;
      const matchesTypeFilter = filterType ? lesson.type === filterType : true;
      
      return matchesSearch && matchesCourseFilter && matchesTypeFilter;
    }
  );
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  
  const handleEditLesson = (lesson) => {
    setCurrentLesson(lesson);
    setIsEdit(true);
    setOpenDialog(true);
  };
  
  const handleAddLesson = () => {
    setCurrentLesson({
      id: lessons.length + 1,
      title: '',
      courseId: 1,
      courseName: courseOptions[0] || '',
      type: 'Video',
      duration: '',
      order: 1,
      isPublished: true,
      description: '',
      content: '',
    });
    setIsEdit(false);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLesson({
      ...currentLesson,
      [name]: value,
    });
  };
  
  const handleSwitchChange = (e) => {
    setCurrentLesson({
      ...currentLesson,
      isPublished: e.target.checked,
    });
  };
  
  const handleSaveLesson = () => {
    if (isEdit) {
      setLessons(
        lessons.map((lesson) => (lesson.id === currentLesson.id ? currentLesson : lesson))
      );
    } else {
      setLessons([...lessons, currentLesson]);
    }
    handleCloseDialog();
  };
  
  const handleDeleteLesson = (id) => {
    setLessons(lessons.filter((lesson) => lesson.id !== id));
  };
  
  const clearFilters = () => {
    setFilterCourse('');
    setFilterType('');
    setSearchTerm('');
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Lessons Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLesson}
        >
          Add Lesson
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                placeholder="Search lessons..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Course</InputLabel>
                <Select
                  value={filterCourse}
                  label="Filter by Course"
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courseOptions.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Video">Video</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                  <MenuItem value="Exercise">Exercise</MenuItem>
                  <MenuItem value="Audio">Audio</MenuItem>
                  <MenuItem value="Reading">Reading</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell width={50} />
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLessons
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((lesson) => (
                  <LessonRow 
                    key={lesson.id} 
                    lesson={lesson} 
                    handleEditLesson={handleEditLesson}
                    handleDeleteLesson={handleDeleteLesson}
                  />
                ))}
              {filteredLessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No lessons found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLessons.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add/Edit Lesson Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Lesson Title"
                name="title"
                value={currentLesson.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Lesson Type</InputLabel>
                <Select
                  name="type"
                  value={currentLesson.type}
                  label="Lesson Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Video">Video</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                  <MenuItem value="Exercise">Exercise</MenuItem>
                  <MenuItem value="Audio">Audio</MenuItem>
                  <MenuItem value="Reading">Reading</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  name="courseName"
                  value={currentLesson.courseName}
                  label="Course"
                  onChange={handleInputChange}
                >
                  {courseOptions.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={currentLesson.duration}
                onChange={handleInputChange}
                placeholder={currentLesson.type === 'Quiz' || currentLesson.type === 'Exercise' ? '10 questions' : '15 mins'}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Order"
                name="order"
                type="number"
                value={currentLesson.order}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content URL or Text"
                name="content"
                value={currentLesson.content}
                onChange={handleInputChange}
                placeholder={currentLesson.type === 'Video' ? 'https://example.com/video.mp4' : 'Lesson content here...'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentLesson.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={currentLesson.isPublished} 
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Publish Lesson"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveLesson} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Lessons; 
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Rating,
  InputAdornment,
  Divider,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// Dummy course data
const generateCourses = () => {
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Italian', 'Russian'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const courses = [];
  
  for (let i = 1; i <= 12; i++) {
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomRating = (3 + Math.random() * 2).toFixed(1); // Rating between 3 and 5
    const randomStudents = Math.floor(Math.random() * 1000);
    const randomLessons = Math.floor(Math.random() * 50) + 10;
    
    courses.push({
      id: i,
      title: `${randomLanguage} for ${randomLevel === 'All Levels' ? 'Everyone' : randomLevel}`,
      description: `A comprehensive ${randomLanguage} course for ${randomLevel.toLowerCase()} students to improve vocabulary, grammar, and conversation skills.`,
      language: randomLanguage,
      level: randomLevel,
      lessons: randomLessons,
      duration: `${randomLessons * 15} mins`,
      rating: parseFloat(randomRating),
      students: randomStudents,
      instructor: `Instructor ${i}`,
      image: `https://source.unsplash.com/random/300x200?${randomLanguage.toLowerCase()},language`,
      price: (Math.floor(Math.random() * 50) + 20) * 0.99,
    });
  }
  
  return courses;
};

const initialCourses = generateCourses();

const Courses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({
    id: '',
    title: '',
    description: '',
    language: '',
    level: 'Beginner',
    lessons: 0,
    duration: '',
    rating: 0,
    students: 0,
    instructor: '',
    image: '',
    price: 0,
  });
  const [isEdit, setIsEdit] = useState(false);
  
  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.level.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleOpenDialog = (course = null) => {
    if (course) {
      setCurrentCourse(course);
      setIsEdit(true);
    } else {
      setCurrentCourse({
        id: courses.length + 1,
        title: '',
        description: '',
        language: '',
        level: 'Beginner',
        lessons: 0,
        duration: '',
        rating: 0,
        students: 0,
        instructor: '',
        image: 'https://source.unsplash.com/random/300x200?language',
        price: 0,
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
    setCurrentCourse({
      ...currentCourse,
      [name]: value,
    });
  };
  
  const handleSaveCourse = () => {
    if (isEdit) {
      setCourses(
        courses.map((course) => (course.id === currentCourse.id ? currentCourse : course))
      );
    } else {
      setCourses([...courses, currentCourse]);
    }
    handleCloseDialog();
  };
  
  const handleDeleteCourse = (id) => {
    setCourses(courses.filter((course) => course.id !== id));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Courses Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search courses..."
            variant="outlined"
            size="small"
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Course
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image={course.image}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Chip
                    label={course.level}
                    size="small"
                    sx={{
                      bgcolor: 
                        course.level === 'Beginner' ? '#4caf50' :
                        course.level === 'Intermediate' ? '#ff9800' : 
                        course.level === 'Advanced' ? '#f44336' : '#2196f3',
                      color: 'white',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {course.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LanguageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{course.language}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{course.lessons} lessons ({course.duration})</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Rating value={course.rating} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({course.rating}) • {course.students} students
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  ${course.price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpenDialog(course)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => handleDeleteCourse(course.id)}>
                  Delete
                </Button>
                <Button size="small" color="primary" sx={{ ml: 'auto' }}>
                  View Lessons
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Add/Edit Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Course' : 'Add New Course'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={currentCourse.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Language"
                name="language"
                value={currentCourse.language}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={currentCourse.level}
                  label="Level"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="All Levels">All Levels</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instructor"
                name="instructor"
                value={currentCourse.instructor}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Lessons Count"
                name="lessons"
                type="number"
                value={currentCourse.lessons}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={currentCourse.duration}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={currentCourse.price}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={currentCourse.image}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentCourse.description}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCourse} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Floating action button to add new course */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Courses; 
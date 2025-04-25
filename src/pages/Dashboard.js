import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { 
  PeopleAlt, 
  Book, 
  School, 
  TrendingUp, 
  Person,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const Dashboard = () => {
  // Dummy data for statistics
  const statistics = [
    { title: 'Total Users', value: '2,543', icon: <PeopleAlt />, color: '#1976d2' },
    { title: 'Courses', value: '48', icon: <Book />, color: '#ff9800' },
    { title: 'Lessons', value: '324', icon: <School />, color: '#4caf50' },
    { title: 'Active Enrollments', value: '1,893', icon: <TrendingUp />, color: '#f44336' },
  ];

  // Dummy data for the doughnut chart
  const doughnutData = {
    labels: ['Beginners', 'Intermediate', 'Advanced'],
    datasets: [
      {
        data: [55, 30, 15],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 0,
      },
    ],
  };

  // Dummy data for the line chart
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'User Registrations',
        data: [65, 59, 80, 81, 56, 55],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
      {
        label: 'Course Enrollments',
        data: [28, 48, 40, 19, 86, 27],
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Growth',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Dummy data for recent activities
  const recentActivities = [
    { user: 'John Doe', action: 'enrolled in "Spanish for Beginners"', time: '10 minutes ago' },
    { user: 'Sarah Smith', action: 'completed "French Vocabulary - Level 2"', time: '1 hour ago' },
    { user: 'Michael Brown', action: 'joined the platform', time: '3 hours ago' },
    { user: 'Emma Wilson', action: 'achieved 95% in "German Grammar Test"', time: '5 hours ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Welcome to the WORDWISE Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statistics.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56, mr: 2 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{stat.value}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Growth Overview
            </Typography>
            <Line data={lineData} options={lineOptions} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Student Levels
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: '240px' }}>
              <Doughnut data={doughnutData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.user}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {activity.action}
                            </Typography>
                            {` — ${activity.time}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Latest Courses
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {[
                  { title: 'Mandarin Chinese for Beginners', students: 156, rating: 4.8 },
                  { title: 'Business English', students: 89, rating: 4.6 },
                  { title: 'Japanese Conversation Skills', students: 124, rating: 4.9 },
                  { title: 'Spanish for Travelers', students: 75, rating: 4.7 },
                ].map((course, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <Book />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {course.students} students
                            </Typography>
                            {` — Rating: ${course.rating}/5`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < 3 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
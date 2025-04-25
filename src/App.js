import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import UserFlashcards from './pages/UserFlashcards';
import ContentReports from './pages/ContentReports';
import Courses from './pages/Courses';
import Lessons from './pages/Lessons';
import MainLayout from './components/layout/MainLayout';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="admin/login" element={<Login />} />
          <Route path="admin/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:userId/flashcards" element={<UserFlashcards />} />
            <Route path="reports" element={<ContentReports />} />
            <Route path="flashcardset" element={<Courses />} />
            <Route path="multiplechoice" element={<Lessons />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 
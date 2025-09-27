import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeaveRequestPage from './pages/LeaveRequestPage';
import ApprovalPage from './pages/ApprovalPage';
import AdminPage from './pages/AdminPage';
import ForceChangePasswordPage from './pages/ForceChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

// A component to handle redirection for already logged-in users
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/dashboard" /> : children;
};

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route 
                path="/" 
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/request-leave" 
                element={
                    <ProtectedRoute>
                        <LeaveRequestPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/approvals" 
                element={
                    <ProtectedRoute>
                        <ApprovalPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute>
                        <AdminPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/force-change-password" 
                element={
                    <ProtectedRoute>
                        <ForceChangePasswordPage />
                    </ProtectedRoute>
                }
            />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

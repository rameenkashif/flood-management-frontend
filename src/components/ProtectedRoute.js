import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box } from '@mui/material';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user || !user.token) return <Navigate to="/login" />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  // wrap pages in a centered content area for consistent alignment
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, py: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 1200 }}>{children}</Box>
    </Box>
  );
}

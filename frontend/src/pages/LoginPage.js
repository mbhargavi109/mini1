import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, MenuItem, Alert, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/login', { email, password });
      // Optionally check role here if needed
      if (res.data.user.role !== role) {
        setError('Role mismatch.');
        return;
      }
      // Save token, redirect, etc.
      localStorage.setItem('token', res.data.token);
      navigate('/'); // Redirect to dashboard (to be implemented)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" align="center" gutterBottom>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            select
            fullWidth
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            {roles.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Login</Button>
        </Box>
        <Box mt={2} textAlign="center">
          <Link href="/register" underline="hover">Don't have an account? Register</Link>
        </Box>
      </Box>
    </Container>
  );
} 
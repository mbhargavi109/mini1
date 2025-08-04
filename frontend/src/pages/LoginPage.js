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
    
    // Basic form validation
    if (!email.trim() || !password.trim() || !role) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      const res = await axios.post('/auth/login', { email, password, role });
      
      // Validate that the user's actual role matches the selected role
      if (res.data.user.role !== role) {
        setError(`Invalid credentials for ${role} role. Please check your email and password.`);
        return;
      }
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (res.data.user.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundImage: 'url("https://images.unsplash.com/photo-1592280771190-3e2e4d571952?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29sbGVnZSUyMGJ1aWxkaW5nfGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=60&w=3000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Box 
          sx={{ 
            p: 4, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}
          >
            Welcome Back
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              select
              required
              fullWidth
              label="Role"
              value={role}
              onChange={e => setRole(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              {roles.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              sx={{ 
                mt: 3, 
                mb: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Sign In
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Link 
              href="/register" 
              underline="hover"
              sx={{ 
                color: '#667eea',
                fontWeight: 500,
                '&:hover': {
                  color: '#5a6fd8',
                }
              }}
            >
              Don't have an account? Register
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, MenuItem, Alert, Link, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Validation functions
const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return '';
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return '';
};

const validateRollNumber = (rollNumber) => {
  if (!rollNumber) return 'Roll number is required';
  if (rollNumber.length < 3) return 'Roll number must be at least 3 characters long';
  return '';
};

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
];
const departments = [
  { value: 1, label: 'Computer Science' },
  { value: 2, label: 'Mechanical' },
  { value: 3, label: 'Electrical' },
];
const semesters = [
  { value: 1, label: 'Semester 1' },
  { value: 2, label: 'Semester 2' },
  { value: 3, label: 'Semester 3' },
];

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentIds, setDepartmentIds] = useState([]);
  const [semesterIds, setSemesterIds] = useState([]);
  const [subjectIds, setSubjectIds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch subjects when departmentIds and semesterIds are selected
    const fetchSubjects = async () => {
      let dep = role === 'teacher' ? departmentIds : departmentIds[0] ? [departmentIds[0]] : [];
      let sem = role === 'teacher' ? semesterIds : semesterIds[0] ? [semesterIds[0]] : [];
      if (dep.length && sem.length) {
        try {
          let allSubjects = [];
          if (role === 'teacher') {
            // Fetch for all combinations of selected departments and semesters
            for (let d of dep) {
              for (let s of sem) {
                const res = await axios.get('/subjects', {
                  params: { departmentId: d, semesterId: s }
                });
                allSubjects = allSubjects.concat(res.data);
              }
            }
            // Remove duplicates by subject id
            const uniqueSubjects = [];
            const seen = new Set();
            for (const subj of allSubjects) {
              if (!seen.has(subj.id)) {
                uniqueSubjects.push(subj);
                seen.add(subj.id);
              }
            }
            setSubjects(uniqueSubjects);
          } else {
            // Student: only one department and semester
            const res = await axios.get('/subjects', {
              params: { departmentId: dep[0], semesterId: sem[0] }
            });
            setSubjects(res.data);
          }
        } catch (err) {
          setSubjects([]);
        }
      } else {
        setSubjects([]);
      }
      setSubjectIds([]);
    };
    fetchSubjects();
  }, [departmentIds, semesterIds, role]);

  // Validate form whenever relevant fields change
  useEffect(() => {
    const errors = {};
    
    // Validate name
    const nameError = validateName(name);
    if (nameError) errors.name = nameError;
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    
    // Validate department selection
    if (role === 'teacher') {
      if (departmentIds.length === 0) {
        errors.departments = 'Please select at least one department';
      }
    } else {
      if (!departmentIds[0]) {
        errors.departments = 'Please select a department';
      }
    }
    
    // Validate semester selection
    if (role === 'teacher') {
      if (semesterIds.length === 0) {
        errors.semesters = 'Please select at least one semester';
      }
    } else {
      if (!semesterIds[0]) {
        errors.semesters = 'Please select a semester';
      }
    }
    
    // Validate subject selection (only for teachers)
    if (role === 'teacher' && subjectIds.length === 0) {
      errors.subjects = 'Please select at least one subject';
    }
    
    // Validate roll number (only for students)
    if (role === 'student') {
      const rollNumberError = validateRollNumber(rollNumber);
      if (rollNumberError) errors.rollNumber = rollNumberError;
    }
    
    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [name, email, password, departmentIds, semesterIds, subjectIds, rollNumber, role]);

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      departments: true,
      semesters: true,
      subjects: role === 'teacher' ? true : false,
      rollNumber: role === 'student' ? true : false
    });
    
    // Check if form is valid
    if (!isFormValid) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      const payload = {
        name,
        email,
        password,
        role,
        departmentIds: role === 'teacher' ? departmentIds : departmentIds[0] ? [departmentIds[0]] : [],
        semesterIds: role === 'teacher' ? semesterIds : semesterIds[0] ? [semesterIds[0]] : [],
        subjectIds: role === 'teacher' ? subjectIds : subjectIds[0] ? [subjectIds[0]] : [],
        ...(role === 'student' && { rollNumber }),
      };
      await axios.post('/auth/register', payload);
      setSuccess('Registration successful! You can now login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            Create Account
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              error={touched.name && validationErrors.name}
              helperText={touched.name && validationErrors.name}
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
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              error={touched.email && validationErrors.email}
              helperText={touched.email && validationErrors.email}
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
              onBlur={() => handleFieldBlur('password')}
              error={touched.password && validationErrors.password}
              helperText={touched.password && validationErrors.password}
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
          <FormControl fullWidth margin="normal" error={touched.departments && !!validationErrors.departments}>
            <InputLabel>Department</InputLabel>
            <Select
              multiple={role === 'teacher'}
              value={role === 'teacher' ? departmentIds : departmentIds[0] || ''}
              onChange={e => {
                if (role === 'teacher') {
                  setDepartmentIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value);
                } else {
                  setDepartmentIds([e.target.value]);
                }
              }}
              onBlur={() => handleFieldBlur('departments')}
              input={<OutlinedInput label="Department" />}
              renderValue={selected => {
                const arr = role === 'teacher' ? (Array.isArray(selected) ? selected : selected ? [selected] : []) : [selected];
                return departments.filter(d => arr.includes(d.value)).map(d => d.label).join(', ');
              }}
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
              {departments.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {role === 'teacher' && <Checkbox checked={departmentIds.indexOf(option.value) > -1} />}
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
            {touched.departments && validationErrors.departments && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {validationErrors.departments}
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal" error={touched.semesters && !!validationErrors.semesters}>
            <InputLabel>Semester</InputLabel>
            <Select
              multiple={role === 'teacher'}
              value={role === 'teacher' ? semesterIds : semesterIds[0] || ''}
              onChange={e => {
                if (role === 'teacher') {
                  setSemesterIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value);
                } else {
                  setSemesterIds([e.target.value]);
                }
              }}
              onBlur={() => handleFieldBlur('semesters')}
              input={<OutlinedInput label="Semester" />}
              renderValue={selected => {
                const arr = role === 'teacher' ? (Array.isArray(selected) ? selected : selected ? [selected] : []) : [selected];
                return semesters.filter(s => arr.includes(s.value)).map(s => s.label).join(', ');
              }}
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
              {semesters.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {role === 'teacher' && <Checkbox checked={semesterIds.indexOf(option.value) > -1} />}
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
            {touched.semesters && validationErrors.semesters && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {validationErrors.semesters}
              </Typography>
            )}
          </FormControl>
          {/* Subject selection only for teachers */}
          {role === 'teacher' && (
            <FormControl fullWidth margin="normal" error={touched.subjects && !!validationErrors.subjects}>
              <InputLabel>Subject</InputLabel>
              <Select
                multiple
                value={subjectIds}
                onChange={e => setSubjectIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                onBlur={() => handleFieldBlur('subjects')}
                input={<OutlinedInput label="Subject" />}
                renderValue={selected => {
                  const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
                  return subjects.filter(s => arr.includes(s.id)).map(s => s.name).join(', ');
                }}
                disabled={subjects.length === 0}
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
                {subjects.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={subjectIds.indexOf(option.id) > -1} />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
              {touched.subjects && validationErrors.subjects && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {validationErrors.subjects}
                </Typography>
              )}
            </FormControl>
          )}
          {/* Roll Number only for students */}
          {role === 'student' && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Roll Number"
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              onBlur={() => handleFieldBlur('rollNumber')}
              error={touched.rollNumber && validationErrors.rollNumber}
              helperText={touched.rollNumber && validationErrors.rollNumber}
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
          )}
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
            disabled={!isFormValid}
          >
            Create Account
          </Button>
        </Box>
        <Box mt={2} textAlign="center">
          <Link 
            href="/login" 
            underline="hover"
            sx={{ 
              color: '#667eea',
              fontWeight: 500,
              '&:hover': {
                color: '#5a6fd8',
              }
            }}
          >
            Already have an account? Login
          </Link>
        </Box>
        </Box>
      </Container>
    </Box>
  );
} 
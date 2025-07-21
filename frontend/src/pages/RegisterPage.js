import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, MenuItem, Alert, Link, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        name,
        email,
        password,
        role,
        departmentIds: role === 'teacher' ? departmentIds : departmentIds[0] ? [departmentIds[0]] : [],
        semesterIds: role === 'teacher' ? semesterIds : semesterIds[0] ? [semesterIds[0]] : [],
        subjectIds: role === 'teacher' ? subjectIds : subjectIds[0] ? [subjectIds[0]] : [],
      };
      await axios.post('/auth/register', payload);
      setSuccess('Registration successful! You can now login.');
      if (role === 'teacher') {
        setTimeout(() => navigate('/teacher-dashboard'), 1500);
      } else {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" align="center" gutterBottom>Register</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
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
          <FormControl fullWidth margin="normal">
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
              input={<OutlinedInput label="Department" />}
              renderValue={selected => {
                const arr = role === 'teacher' ? (Array.isArray(selected) ? selected : selected ? [selected] : []) : [selected];
                return departments.filter(d => arr.includes(d.value)).map(d => d.label).join(', ');
              }}
            >
              {departments.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {role === 'teacher' && <Checkbox checked={departmentIds.indexOf(option.value) > -1} />}
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
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
              input={<OutlinedInput label="Semester" />}
              renderValue={selected => {
                const arr = role === 'teacher' ? (Array.isArray(selected) ? selected : selected ? [selected] : []) : [selected];
                return semesters.filter(s => arr.includes(s.value)).map(s => s.label).join(', ');
              }}
            >
              {semesters.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {role === 'teacher' && <Checkbox checked={semesterIds.indexOf(option.value) > -1} />}
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              multiple={role === 'teacher'}
              value={subjectIds}
              onChange={e => setSubjectIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Subject" />}
              renderValue={selected => {
                const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
                return subjects.filter(s => arr.includes(s.id)).map(s => s.name).join(', ');
              }}
              disabled={subjects.length === 0}
            >
              {subjects.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {role === 'teacher' && <Checkbox checked={subjectIds.indexOf(option.id) > -1} />}
                  <ListItemText primary={option.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Register</Button>
        </Box>
        <Box mt={2} textAlign="center">
          <Link href="/login" underline="hover">Already have an account? Login</Link>
        </Box>
      </Box>
    </Container>
  );
} 
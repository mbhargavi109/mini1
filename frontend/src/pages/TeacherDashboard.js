import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, Divider, FormControl, InputLabel, Select, MenuItem, Stack, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const teacherId = JSON.parse(localStorage.getItem('user'))?.id || 1;

  useEffect(() => {
    axios.get(`/teacher/${teacherId}/profile`).then(res => setProfile(res.data));
    axios.get('/departments').then(res => setDepartments(res.data));
    axios.get('/semesters').then(res => setSemesters(res.data));
  }, [teacherId]);

  useEffect(() => {
    if (departmentId && semesterId) {
      axios.get('/subjects', { params: { departmentId, semesterId } })
        .then(res => setSubjects(res.data));
    } else {
      setSubjects([]);
    }
    setSubjectId('');
  }, [departmentId, semesterId]);

  useEffect(() => {
    if (departmentId && semesterId && subjectId) {
      setLoading(true);
      axios.get('/notes', { params: { departmentId, semesterId, subjectId } })
        .then(res => setNotes(res.data))
        .finally(() => setLoading(false));
    } else {
      setNotes([]);
    }
  }, [departmentId, semesterId, subjectId]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Teacher Dashboard</Typography>
        {profile && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Teacher Profile</Typography>
              <Typography>Name: {profile.name}</Typography>
              <Typography>Email: {profile.email}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Departments:</Typography>
              {profile.departments.map(dep => <Chip key={dep.id} label={dep.name} sx={{ mr: 1, mb: 1 }} />)}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Semesters:</Typography>
              {profile.semesters.map(sem => <Chip key={sem.id} label={sem.name} sx={{ mr: 1, mb: 1 }} />)}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Subjects:</Typography>
              {profile.subjects.map(sub => <Chip key={sub.id} label={sub.name} sx={{ mr: 1, mb: 1 }} />)}
            </CardContent>
          </Card>
        )}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentId}
                label="Department"
                onChange={e => setDepartmentId(e.target.value)}
              >
                {departments.map(dep => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={semesterId}
                label="Semester"
                onChange={e => setSemesterId(e.target.value)}
              >
                {semesters.map(sem => (
                  <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectId}
                label="Subject"
                onChange={e => setSubjectId(e.target.value)}
                disabled={!subjects.length}
              >
                {subjects.map(sub => (
                  <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
        <Typography variant="h6" gutterBottom>Selected Filters</Typography>
        <Typography>Department: {departments.find(d => d.id === departmentId)?.name || '-'}</Typography>
        <Typography>Semester: {semesters.find(s => s.id === semesterId)?.name || '-'}</Typography>
        <Typography>Subject: {subjects.find(s => s.id === subjectId)?.name || '-'}</Typography>
        <Typography variant="h6" gutterBottom>Filtered Notes</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {notes.map(note => (
              <ListItem key={note.id} divider>
                <ListItemText
                  primary={note.title}
                  secondary={note.filePath}
                />
                <a href={note.filePath} download target="_blank" rel="noopener noreferrer">Download</a>
              </ListItem>
            ))}
            {!notes.length && <ListItem><ListItemText primary="No notes found for this selection." /></ListItem>}
          </List>
        )}
      </Box>
    </Container>
  );
} 
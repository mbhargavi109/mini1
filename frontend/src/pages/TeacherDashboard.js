import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, Divider, FormControl, InputLabel, Select, MenuItem, Stack, Paper, List, ListItem, ListItemText, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
        {profile && (
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Teacher Profile</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell variant="head">Name</TableCell>
                      <TableCell>{profile.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell variant="head">Email</TableCell>
                      <TableCell>{profile.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell variant="head">Departments</TableCell>
                      <TableCell>
                        {profile.departments.map(dep => (
                          <Chip key={dep.id} label={dep.name} sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell variant="head">Semesters</TableCell>
                      <TableCell>
                        {profile.semesters.map(sem => (
                          <Chip key={sem.id} label={sem.name} sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell variant="head">Subjects</TableCell>
                      <TableCell>
                        {profile.subjects.map(sub => (
                          <Chip key={sub.id} label={sub.name} sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}
        <Typography variant="h6" gutterBottom>Class Notes</Typography>
        
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default', boxShadow: 1, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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

        <Paper sx={{ p: 2, mb: 3, boxShadow: 3, borderRadius: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {notes.map(note => (
                <ListItem key={note.id} divider secondaryAction={
                  <a href={note.filePath} download target="_blank" rel="noopener noreferrer">
                    <Chip label="Download" color="primary" clickable />
                  </a>
                }>
                  <ListItemText
                    primary={<Typography fontWeight={600}>{note.title}</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary">{note.filePath}</Typography>}
                  />
                </ListItem>
              ))}
              {!notes.length && <ListItem><ListItemText primary="No class notes found for this selection." /></ListItem>}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 
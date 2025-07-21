import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, Divider, FormControl, InputLabel, Select, MenuItem, Stack, Paper, List, ListItem, ListItemText, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, OutlinedInput, Checkbox, Snackbar, Alert } from '@mui/material';
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
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartmentIds, setEditDepartmentIds] = useState([]);
  const [editSemesterIds, setEditSemesterIds] = useState([]);
  const [editSubjectIds, setEditSubjectIds] = useState([]);
  const [editSubjects, setEditSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
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

  useEffect(() => {
    const fetchEditSubjects = async () => {
      let allSubjects = [];
      for (let d of editDepartmentIds) {
        for (let s of editSemesterIds) {
          const res = await axios.get('/subjects', { params: { departmentId: d, semesterId: s } });
          allSubjects = allSubjects.concat(res.data);
        }
      }
      // Remove duplicates
      const uniqueSubjects = [];
      const seen = new Set();
      for (const subj of allSubjects) {
        if (!seen.has(subj.id)) {
          uniqueSubjects.push(subj);
          seen.add(subj.id);
        }
      }
      setEditSubjects(uniqueSubjects);
    };
    if (editDepartmentIds.length && editSemesterIds.length) {
      fetchEditSubjects();
    } else {
      setEditSubjects([]);
      setEditSubjectIds([]);
    }
  }, [editDepartmentIds, editSemesterIds, editOpen]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {profile && (
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Teacher Profile</Typography>
              <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={e => {
                setEditName(profile.name);
                setEditEmail(profile.email);
                setEditDepartmentIds(profile.departments.map(d => d.id));
                setEditSemesterIds(profile.semesters.map(s => s.id));
                setEditSubjectIds(profile.subjects.map(s => s.id));
                setEditOpen(true);
                e.stopPropagation();
              }}>Edit Profile</Button>
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
        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              label="Name"
              fullWidth
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
            <TextField
              margin="normal"
              label="Email"
              fullWidth
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Departments</InputLabel>
              <Select
                multiple
                value={editDepartmentIds}
                onChange={e => setEditDepartmentIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Departments" />}
                renderValue={selected => departments.filter(d => selected.includes(d.id)).map(d => d.name).join(', ')}
              >
                {departments.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={editDepartmentIds.indexOf(option.id) > -1} />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Semesters</InputLabel>
              <Select
                multiple
                value={editSemesterIds}
                onChange={e => setEditSemesterIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Semesters" />}
                renderValue={selected => semesters.filter(s => selected.includes(s.id)).map(s => s.name).join(', ')}
              >
                {semesters.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={editSemesterIds.indexOf(option.id) > -1} />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Subjects</InputLabel>
              <Select
                multiple
                value={editSubjectIds}
                onChange={e => setEditSubjectIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Subjects" />}
                renderValue={selected => editSubjects.filter(s => selected.includes(s.id)).map(s => s.name).join(', ')}
                disabled={editSubjects.length === 0}
              >
                {editSubjects.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={editSubjectIds.indexOf(option.id) > -1} />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={async () => {
              setSaving(true);
              setEditError('');
              try {
                const res = await axios.patch(`/teacher/${teacherId}/profile`, {
                  name: editName,
                  email: editEmail,
                  departmentIds: editDepartmentIds,
                  semesterIds: editSemesterIds,
                  subjectIds: editSubjectIds,
                });
                setProfile(res.data);
                setEditSuccess(true);
                setEditOpen(false);
              } catch (err) {
                setEditError(err.response?.data?.error || 'Failed to update profile');
              } finally {
                setSaving(false);
              }
            }} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!editError} autoHideDuration={4000} onClose={() => setEditError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setEditError('')} sx={{ width: '100%' }}>{editError}</Alert>
        </Snackbar>
        <Snackbar open={editSuccess} autoHideDuration={3000} onClose={() => setEditSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setEditSuccess(false)} sx={{ width: '100%' }}>Profile updated successfully!</Alert>
        </Snackbar>
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
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
  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher';

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

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Departments</InputLabel>
              <Select
                multiple
                value={editDepartmentIds}
                onChange={e => setEditDepartmentIds(e.target.value)}
                input={<OutlinedInput label="Departments" />}
                renderValue={selected => {
                  const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
                  return departments.filter(d => arr.includes(d.id)).map(d => d.name).join(', ');
                }}
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
                onChange={e => setEditSemesterIds(e.target.value)}
                input={<OutlinedInput label="Semesters" />}
                renderValue={selected => {
                  const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
                  return semesters.filter(s => arr.includes(s.id)).map(s => s.name).join(', ');
                }}
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
                onChange={e => setEditSubjectIds(e.target.value)}
                input={<OutlinedInput label="Subjects" />}
                renderValue={selected => {
                  const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
                  return editSubjects.filter(s => arr.includes(s.id)).map(s => s.name).join(', ');
                }}
                disabled={!editSubjects.length}
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
            <Button onClick={async () => {
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
      </Box>
    </Container>
  );
} 
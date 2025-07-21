import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Chip, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user?.id;
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editSemesterId, setEditSemesterId] = useState('');
  const [editSubjectIds, setEditSubjectIds] = useState([]);
  const [editSubjects, setEditSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    axios.get(`/student/${studentId}/profile`).then(res => setProfile(res.data));
    axios.get('/departments').then(res => setDepartments(res.data));
    axios.get('/semesters').then(res => setSemesters(res.data));
  }, [studentId]);

  useEffect(() => {
    if (editDepartmentId && editSemesterId) {
      axios.get('/subjects', { params: { departmentId: editDepartmentId, semesterId: editSemesterId } })
        .then(res => setEditSubjects(res.data));
    } else {
      setEditSubjects([]);
    }
  }, [editDepartmentId, editSemesterId, editOpen]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {profile && (
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Student Profile</Typography>
              <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={e => {
                setEditName(profile.name);
                setEditEmail(profile.email);
                setEditDepartmentId(profile.department?.id || '');
                setEditSemesterId(profile.semester?.id || '');
                setEditSubjectIds(profile.subjects?.map(s => s.id) || []);
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
                      <TableCell variant="head">Department</TableCell>
                      <TableCell>{profile.department?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell variant="head">Semester</TableCell>
                      <TableCell>{profile.semester?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell variant="head">Subjects</TableCell>
                      <TableCell>
                        {profile.subjects?.map(sub => (
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
              disabled
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                value={editDepartmentId}
                onChange={e => setEditDepartmentId(e.target.value)}
                input={<OutlinedInput label="Department" />}
              >
                {departments.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Semester</InputLabel>
              <Select
                value={editSemesterId}
                onChange={e => setEditSemesterId(e.target.value)}
                input={<OutlinedInput label="Semester" />}
              >
                {semesters.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
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
                const res = await axios.patch(`/student/${studentId}/profile`, {
                  name: editName,
                  departmentId: editDepartmentId,
                  semesterId: editSemesterId,
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
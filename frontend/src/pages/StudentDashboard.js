import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Chip, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, TableHead } from '@mui/material';
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
  const [editRollNumber, setEditRollNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');

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

  useEffect(() => {
    if (profile && profile.department && profile.semester && profile.subjects && profile.subjects.length > 0) {
      fetchNotes(profile.department.id, profile.semester.id, profile.subjects.map(s => s.id), searchTerm, filterSubjectId);
    } else {
      setNotes([]);
    }
    // eslint-disable-next-line
  }, [profile, searchTerm, filterSubjectId]);

  const fetchNotes = async (departmentId, semesterId, subjectIds, search, filterSubjectId) => {
    setLoadingNotes(true);
    try {
      let params = { departmentId, semesterId };
      let ids = subjectIds;
      if (filterSubjectId) {
        ids = [Number(filterSubjectId)];
      }
      if (ids && ids.length > 0) params.subjectIds = ids.join(',');
      if (search) params.search = search;
      const response = await axios.get('/notes', { params });
      setNotes(response.data);
    } catch (error) {
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDownloadNote = async (note) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/download-note/${note.id}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      let filename = note.title ? `${note.title}${note.filePath ? note.filePath.substring(note.filePath.lastIndexOf('.')) : ''}` : 'downloaded_file';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      let message = 'Failed to download file.';
      if (error.response && error.response.data) {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const json = JSON.parse(reader.result);
            if (json && json.error) {
              alert(message + '\n' + json.error);
              return;
            }
          } catch {}
          alert(message);
        };
        reader.readAsText(error.response.data);
      } else if (error.message) {
        alert(message + '\n' + error.message);
      } else {
        alert(message);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {profile && (
          <>
            <Accordion defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>Student Profile</Typography>
                <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={e => {
                  setEditName(profile.name);
                  setEditEmail(profile.email);
                  setEditDepartmentId(profile.department?.id || '');
                  setEditSemesterId(profile.semester?.id || '');
                  setEditSubjectIds(profile.subjects?.map(s => s.id) || []);
                  setEditRollNumber(profile.rollNumber || '');
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
                        <TableCell variant="head">Roll Number</TableCell>
                        <TableCell>{profile.rollNumber}</TableCell>
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
            <Accordion defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>Class Notes</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={filterSubjectId}
                      onChange={e => setFilterSubjectId(e.target.value)}
                      input={<OutlinedInput label="Subject" />}
                    >
                      <MenuItem value="">All Subjects</MenuItem>
                      {profile.subjects?.map(option => (
                        <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Search by Title"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    variant="outlined"
                  />
                </Box>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Semester</TableCell>
                        <TableCell>Teacher</TableCell>
                        <TableCell>Download</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingNotes ? (
                        <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                      ) : notes.length === 0 ? (
                        <TableRow><TableCell colSpan={6}>No notes found.</TableCell></TableRow>
                      ) : notes.map(note => (
                        <TableRow key={note.id}>
                          <TableCell>{note.title}</TableCell>
                          <TableCell>{note.Subject?.name || 'N/A'}</TableCell>
                          <TableCell>{note.Department?.name || 'N/A'}</TableCell>
                          <TableCell>{note.Semester?.name || 'N/A'}</TableCell>
                          <TableCell>{note.teacher?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleDownloadNote(note)}
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </>
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
            <TextField
              margin="normal"
              label="Roll Number"
              fullWidth
              value={editRollNumber}
              onChange={e => setEditRollNumber(e.target.value)}
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
                  rollNumber: editRollNumber,
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
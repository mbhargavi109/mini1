import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, Divider, FormControl, InputLabel, Select, MenuItem, Stack, Paper, List, ListItem, ListItemText, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, OutlinedInput, Checkbox, Snackbar, Alert, IconButton, Grid, InputAdornment, LinearProgress } from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogMode, setNoteDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    filePath: '',
    subjectId: '',
    departmentId: '',
    semesterId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterSemesterId, setFilterSemesterId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [formSubjects, setFormSubjects] = useState([]);
  
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

  // Fetch notes
  useEffect(() => {
    fetchNotes();
  }, [teacherId, searchTerm, filterDepartmentId, filterSemesterId, filterSubjectId]);

  // Handle filter subject changes
  useEffect(() => {
    if (filterDepartmentId && filterSemesterId) {
      axios.get('/subjects', { params: { departmentId: filterDepartmentId, semesterId: filterSemesterId } })
        .then(res => setSubjects(res.data));
    } else {
      setSubjects([]);
    }
    setFilterSubjectId('');
  }, [filterDepartmentId, filterSemesterId]);

  // Handle note form subject changes (dynamic filtering)
  useEffect(() => {
    if (noteForm.departmentId && noteForm.semesterId) {
      axios.get('/subjects', { params: { departmentId: noteForm.departmentId, semesterId: noteForm.semesterId } })
        .then(res => {
          setFormSubjects(res.data);
          setNoteForm(prev => ({ ...prev, subjectId: '' }));
        });
    } else {
      setFormSubjects([]);
      setNoteForm(prev => ({ ...prev, subjectId: '' }));
    }
  }, [noteForm.departmentId, noteForm.semesterId]);

  // Function to fetch notes
  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const params = { teacherId };
      if (searchTerm) params.search = searchTerm;
      if (filterDepartmentId) params.departmentId = filterDepartmentId;
      if (filterSemesterId) params.semesterId = filterSemesterId;
      if (filterSubjectId) params.subjectId = filterSubjectId;
      
      const response = await axios.get('/notes', { params });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNoteError('Failed to fetch notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  // Function to handle note form submission
  const handleNoteSubmit = async () => {
    let uploadedFilePath = null;
    try {
      setNoteError('');
      if (uploadingFile) return; // Prevent double submit
      let filePath = noteForm.filePath;
      // Upload file if a new file is selected
      if (selectedFile) {
        uploadedFilePath = await uploadFile();
        if (!uploadedFilePath) {
          setNoteError('File upload failed. Note was not created.');
          return;
        }
        filePath = uploadedFilePath;
      }
      if (!filePath) {
        setNoteError('Please upload a file.');
        return;
      }
      const noteData = {
        ...noteForm,
        filePath,
        teacherId
      };
      if (noteDialogMode === 'add') {
        await axios.post('/notes', noteData);
        setNoteSuccess('Note added successfully!');
      } else {
        await axios.put(`/notes/${selectedNote.id}`, noteData);
        setNoteSuccess('Note updated successfully!');
      }
      setNoteDialogOpen(false);
      setNoteForm({ title: '', filePath: '', subjectId: '', departmentId: '', semesterId: '' });
      setSelectedNote(null);
      setSelectedFile(null);
      fetchNotes();
    } catch (error) {
      setNoteError(error.response?.data?.error || 'Failed to save note');
      // Clean up uploaded file if note creation failed
      if (uploadedFilePath) {
        try {
          await axios.post('/delete-uploaded-file', { filePath: uploadedFilePath });
        } catch (cleanupErr) {
          // Optionally log cleanup error
        }
      }
    }
  };

  // Function to handle note deletion
  const handleNoteDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`/notes/${noteId}`);
        setNoteSuccess('Note deleted successfully!');
        fetchNotes();
      } catch (error) {
        setNoteError('Failed to delete note');
      }
    }
  };

  // Function to handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setNoteError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setNoteError('Only PDF, DOC, DOCX, and TXT files are allowed');
        return;
      }
      
      setSelectedFile(file);
      setNoteError('');
    }
  };

  // Function to upload file
  const uploadFile = async () => {
    if (!selectedFile) return null;
    setUploadingFile(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await axios.post('/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      if (!response.data.filePath) {
        setNoteError('File upload failed. No file path returned.');
        return null;
      }
      return response.data.filePath;
    } catch (error) {
      setNoteError(error.response?.data?.error || 'Failed to upload file');
      return null;
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  // Function to open note dialog
  const openNoteDialog = (mode, note = null) => {
    setNoteDialogMode(mode);
    setSelectedNote(note);
    setSelectedFile(null);
    if (mode === 'edit' && note) {
      setNoteForm({
        title: note.title,
        filePath: note.filePath,
        subjectId: note.SubjectId,
        departmentId: note.DepartmentId,
        semesterId: note.SemesterId
      });
    } else {
      setNoteForm({ title: '', filePath: '', subjectId: '', departmentId: '', semesterId: '' });
    }
    setNoteDialogOpen(true);
  };

  const handleDownloadNote = async (note) => {
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to download files.');
        return;
      }
      // Fetch the file as a blob
      const response = await axios.get(`/download-note/${note.id}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      // Try to get filename from Content-Disposition header
      let filename = note.title ? `${note.title}${note.filePath ? note.filePath.substring(note.filePath.lastIndexOf('.')) : ''}` : 'downloaded_file';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      // Create a blob URL and trigger download
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
        // Try to read error message from backend
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

        {/* Class Notes Section */}
        <Accordion defaultExpanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Class Notes</Typography>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<AddIcon />}
              sx={{ ml: 2 }} 
              onClick={e => {
                openNoteDialog('add');
                e.stopPropagation();
              }}
            >
              Add Note
            </Button>
          </AccordionSummary>
          <AccordionDetails>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Notes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filterDepartmentId}
                    onChange={(e) => setFilterDepartmentId(e.target.value)}
                    label="Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={filterSemesterId}
                    onChange={(e) => setFilterSemesterId(e.target.value)}
                    label="Semester"
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {semesters.map((sem) => (
                      <MenuItem key={sem.id} value={sem.id}>
                        {sem.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={filterSubjectId}
                    onChange={(e) => setFilterSubjectId(e.target.value)}
                    label="Subject"
                    disabled={!filterDepartmentId || !filterSemesterId}
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    {subjects.map((subj) => (
                      <MenuItem key={subj.id} value={subj.id}>
                        {subj.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Notes Table */}
            {loadingNotes ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No notes found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      notes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {note.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={note.Subject?.name || 'N/A'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={note.Department?.name || 'N/A'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={note.Semester?.name || 'N/A'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadNote(note)}
                                title="Download"
                              >
                                <DownloadIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => openNoteDialog('edit', note)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleNoteDelete(note.id)}
                                title="Delete"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>

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

        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {noteDialogMode === 'add' ? 'Add New Note' : 'Edit Note'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              margin="normal"
              required
            />
            
            {/* File Upload Section */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Upload File
              </Typography>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
              
              {/* File upload button */}
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
                disabled={uploadingFile}
              >
                {selectedFile ? 'Change File' : 'Choose File'}
              </Button>
              
              {/* Selected file display */}
              {selectedFile && (
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={<AttachFileIcon />}
                    label={selectedFile.name}
                    onDelete={() => setSelectedFile(null)}
                    color="primary"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
              
              {/* Current file display (for edit mode) */}
              {noteDialogMode === 'edit' && noteForm.filePath && !selectedFile && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Current file: {noteForm.filePath.split('/').pop()}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mt: 1 }}
                  >
                    Replace File
                  </Button>
                </Box>
              )}
              
              {/* Upload progress */}
              {uploadingFile && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Department</InputLabel>
              <Select
                value={noteForm.departmentId}
                onChange={(e) => setNoteForm({ ...noteForm, departmentId: e.target.value })}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Semester</InputLabel>
              <Select
                value={noteForm.semesterId}
                onChange={(e) => setNoteForm({ ...noteForm, semesterId: e.target.value })}
                label="Semester"
              >
                {semesters.map((sem) => (
                  <MenuItem key={sem.id} value={sem.id}>
                    {sem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={noteForm.subjectId}
                onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                label="Subject"
                disabled={!noteForm.departmentId || !noteForm.semesterId}
              >
                {formSubjects.map((subj) => (
                  <MenuItem key={subj.id} value={subj.id}>
                    {subj.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleNoteSubmit}
              variant="contained"
              disabled={
                !noteForm.title || 
                (!noteForm.filePath && !selectedFile) || 
                !noteForm.departmentId || 
                !noteForm.semesterId || 
                !noteForm.subjectId ||
                uploadingFile
              }
            >
              {uploadingFile ? 'Uploading...' : (noteDialogMode === 'add' ? 'Add Note' : 'Update Note')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Note Success/Error Snackbars */}
        <Snackbar open={!!noteError} autoHideDuration={4000} onClose={() => setNoteError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setNoteError('')} sx={{ width: '100%' }}>{noteError}</Alert>
        </Snackbar>
        <Snackbar open={!!noteSuccess} autoHideDuration={3000} onClose={() => setNoteSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setNoteSuccess('')} sx={{ width: '100%' }}>{noteSuccess}</Alert>
        </Snackbar>
      </Box>
    </Container>
  );
} 
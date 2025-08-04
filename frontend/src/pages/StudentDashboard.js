import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Chip, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, TableHead, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

// Validation functions
const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return '';
};

const validateRollNumber = (rollNumber) => {
  if (!rollNumber) return 'Roll number is required';
  if (rollNumber.length < 3) return 'Roll number must be at least 3 characters long';
  if (!/^[A-Za-z0-9]+$/.test(rollNumber)) return 'Roll number can only contain letters and numbers';
  return '';
};

const validateAssignmentTitle = (title) => {
  if (!title) return 'Assignment title is required';
  if (title.length < 3) return 'Title must be at least 3 characters long';
  return '';
};

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
  
  // Validation states for edit profile
  const [editValidationErrors, setEditValidationErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  
  // Assignment states
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [assignmentFilterSubjectId, setAssignmentFilterSubjectId] = useState('');
  const [assignmentFilterStatus, setAssignmentFilterStatus] = useState('');
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentEditMode, setAssignmentEditMode] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    subjectId: '',
    file: null
  });
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  
  // Validation states for assignment form
  const [assignmentValidationErrors, setAssignmentValidationErrors] = useState({});
  const [assignmentTouched, setAssignmentTouched] = useState({});
  const [isAssignmentFormValid, setIsAssignmentFormValid] = useState(false);

  // Validate edit profile form whenever relevant fields change
  useEffect(() => {
    const errors = {};
    
    // Validate name
    const nameError = validateName(editName);
    if (nameError) errors.name = nameError;
    
    // Validate roll number
    const rollNumberError = validateRollNumber(editRollNumber);
    if (rollNumberError) errors.rollNumber = rollNumberError;
    
    // Validate department selection
    if (!editDepartmentId) {
      errors.department = 'Please select a department';
    }
    
    // Validate semester selection
    if (!editSemesterId) {
      errors.semester = 'Please select a semester';
    }
    
    // Validate subject selection
    if (editSubjectIds.length === 0) {
      errors.subjects = 'Please select at least one subject';
    }
    
    setEditValidationErrors(errors);
    setIsEditFormValid(Object.keys(errors).length === 0);
  }, [editName, editRollNumber, editDepartmentId, editSemesterId, editSubjectIds]);

  // Validate assignment form whenever relevant fields change
  useEffect(() => {
    const errors = {};
    
    // Validate title
    const titleError = validateAssignmentTitle(assignmentFormData.title);
    if (titleError) errors.title = titleError;
    
    // Validate subject selection
    if (!assignmentFormData.subjectId) {
      errors.subjectId = 'Please select a subject';
    }
    
    // Validate file (only for new assignments)
    if (!assignmentEditMode && !assignmentFormData.file) {
      errors.file = 'Please select a file';
    }
    
    setAssignmentValidationErrors(errors);
    setIsAssignmentFormValid(Object.keys(errors).length === 0);
  }, [assignmentFormData.title, assignmentFormData.subjectId, assignmentFormData.file, assignmentEditMode]);

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
      fetchAssignments(profile.department.id, profile.semester.id, profile.subjects.map(s => s.id), assignmentSearchTerm, assignmentFilterSubjectId, assignmentFilterStatus);
    } else {
      setNotes([]);
      setAssignments([]);
    }
    // eslint-disable-next-line
  }, [profile, searchTerm, filterSubjectId, assignmentSearchTerm, assignmentFilterSubjectId, assignmentFilterStatus]);

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

  const fetchAssignments = async (departmentId, semesterId, subjectIds, search, filterSubjectId, filterStatus) => {
    setLoadingAssignments(true);
    try {
      let params = { 
        studentId, 
        departmentId, 
        semesterId 
      };
      let ids = subjectIds;
      if (filterSubjectId) {
        ids = [Number(filterSubjectId)];
      }
      if (ids && ids.length > 0) params.subjectIds = ids.join(',');
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const response = await axios.get('/assignments', { params });
      setAssignments(response.data);
    } catch (error) {
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleDownloadAssignment = async (assignment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/download-assignment/${assignment.id}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      let filename = assignment.title ? `${assignment.title}${assignment.filePath ? assignment.filePath.substring(assignment.filePath.lastIndexOf('.')) : ''}` : 'downloaded_file';
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

  const handleAssignmentSubmit = async () => {
    // Mark all fields as touched
    setAssignmentTouched({
      title: true,
      subjectId: true,
      file: true
    });
    
    // Check if form is valid
    if (!isAssignmentFormValid) {
      setAssignmentError('Please fix the validation errors before submitting');
      return;
    }

    setAssignmentSaving(true);
    setAssignmentError('');
    try {
      const formData = new FormData();
      formData.append('title', assignmentFormData.title);
      formData.append('subjectId', assignmentFormData.subjectId);
      formData.append('file', assignmentFormData.file);
      formData.append('departmentId', profile.department.id);
      formData.append('semesterId', profile.semester.id);
      formData.append('studentId', studentId);

      if (assignmentEditMode) {
        await axios.patch(`/assignments/${assignmentFormData.id}`, formData);
      } else {
        await axios.post('/assignments', formData);
      }

      setAssignmentSuccess(true);
      setAssignmentDialogOpen(false);
      setAssignmentFormData({ title: '', subjectId: '', file: null });
      setAssignmentEditMode(false);
      setAssignmentValidationErrors({});
      setAssignmentTouched({});
      
      // Refresh assignments
      if (profile && profile.department && profile.semester && profile.subjects && profile.subjects.length > 0) {
        fetchAssignments(profile.department.id, profile.semester.id, profile.subjects.map(s => s.id), assignmentSearchTerm, assignmentFilterSubjectId, assignmentFilterStatus);
      }
    } catch (err) {
      setAssignmentError(err.response?.data?.error || 'Failed to save assignment');
    } finally {
      setAssignmentSaving(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setAssignmentFormData({
      id: assignment.id,
      title: assignment.title,
      subjectId: assignment.SubjectId,
      file: null
    });
    setAssignmentEditMode(true);
    setAssignmentDialogOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/assignments/${assignmentId}`);
        setAssignmentSuccess(true);
        
        // Refresh assignments
        if (profile && profile.department && profile.semester && profile.subjects && profile.subjects.length > 0) {
          fetchAssignments(profile.department.id, profile.semester.id, profile.subjects.map(s => s.id), assignmentSearchTerm, assignmentFilterSubjectId, assignmentFilterStatus);
        }
      } catch (err) {
        setAssignmentError(err.response?.data?.error || 'Failed to delete assignment');
      }
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

  const handleEditFieldBlur = (fieldName) => {
    setEditTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleAssignmentFieldBlur = (fieldName) => {
    setAssignmentTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleEditProfile = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditDepartmentId(profile.department?.id || '');
    setEditSemesterId(profile.semester?.id || '');
    setEditSubjectIds(profile.subjects?.map(s => s.id) || []);
    setEditRollNumber(profile.rollNumber || '');
    setEditValidationErrors({});
    setEditTouched({});
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    // Mark all fields as touched
    setEditTouched({
      name: true,
      rollNumber: true,
      department: true,
      semester: true,
      subjects: true
    });
    
    // Check if form is valid
    if (!isEditFormValid) {
      setEditError('Please fix the validation errors before submitting');
      return;
    }
    
    setSaving(true);
    setEditError('');
    try {
      const res = await axios.patch(`/student/${studentId}/profile`, {
        name: editName,
        rollNumber: editRollNumber,
        departmentId: editDepartmentId,
        semesterId: editSemesterId,
        subjectIds: editSubjectIds.map(Number), // ensure numbers
      });
      setProfile(res.data);
      setEditSuccess(true);
      setEditOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
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
                <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={handleEditProfile}>Edit Profile</Button>
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
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleDownloadNote(note)}
                              title="Download"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
            
            {/* Assignments Section */}
            <Accordion defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>My Assignments</Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{ ml: 2 }} 
                  onClick={e => {
                    setAssignmentFormData({ title: '', subjectId: '', file: null });
                    setAssignmentEditMode(false);
                    setAssignmentDialogOpen(true);
                    e.stopPropagation();
                  }}
                >
                  Add Assignment
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Subject</InputLabel>
                    <Select 
                      value={assignmentFilterSubjectId} 
                      onChange={e => setAssignmentFilterSubjectId(e.target.value)} 
                      input={<OutlinedInput label="Subject" />}
                    >
                      <MenuItem value="">All Subjects</MenuItem>
                      {profile.subjects?.map(option => (
                        <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      value={assignmentFilterStatus} 
                      onChange={e => setAssignmentFilterStatus(e.target.value)} 
                      input={<OutlinedInput label="Status" />}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Search by Title" 
                    value={assignmentSearchTerm} 
                    onChange={e => setAssignmentSearchTerm(e.target.value)} 
                    variant="outlined" 
                  />
                </Box>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submitted Date</TableCell>
                        <TableCell>Review Comments</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingAssignments ? (
                        <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                      ) : assignments.length === 0 ? (
                        <TableRow><TableCell colSpan={6}>No assignments found.</TableCell></TableRow>
                      ) : assignments.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell>{assignment.Subject?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={assignment.status} 
                              color={
                                assignment.status === 'approved' ? 'success' : 
                                assignment.status === 'rejected' ? 'error' : 
                                'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {assignment.reviewComment ? (
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    maxWidth: 200, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                  }}
                                  title={assignment.reviewComment}
                                  onClick={() => {
                                    alert(`Review Comments:\n\n${assignment.reviewComment}`);
                                  }}
                                >
                                  {assignment.reviewComment}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Click to view full comment
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No comments yet
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleDownloadAssignment(assignment)}
                                title="Download"
                              >
                                <DownloadIcon />
                              </IconButton>
                              {assignment.status === 'pending' && (
                                <>
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => handleEditAssignment(assignment)}
                                    title="Edit"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                    title="Delete"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </>
                              )}
                            </Box>
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
              onBlur={() => handleEditFieldBlur('name')}
              error={editTouched.name && editValidationErrors.name}
              helperText={editTouched.name && editValidationErrors.name}
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
              onBlur={() => handleEditFieldBlur('rollNumber')}
              error={editTouched.rollNumber && editValidationErrors.rollNumber}
              helperText={editTouched.rollNumber && editValidationErrors.rollNumber}
            />
                          <FormControl fullWidth margin="normal" error={editTouched.department && !!editValidationErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editDepartmentId}
                  onChange={e => setEditDepartmentId(e.target.value)}
                  input={<OutlinedInput label="Department" />}
                  onBlur={() => handleEditFieldBlur('department')}
                >
                {departments.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
              {editTouched.department && editValidationErrors.department && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editValidationErrors.department}
                </Typography>
              )}
            </FormControl>
                          <FormControl fullWidth margin="normal" error={editTouched.semester && !!editValidationErrors.semester}>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={editSemesterId}
                  onChange={e => {
                    setEditSemesterId(e.target.value);
                    setEditSubjectIds([]); // Clear selected subjects when semester changes
                  }}
                  input={<OutlinedInput label="Semester" />}
                  onBlur={() => handleEditFieldBlur('semester')}
                >
                {semesters.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
              {editTouched.semester && editValidationErrors.semester && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editValidationErrors.semester}
                </Typography>
              )}
            </FormControl>
                          <FormControl fullWidth margin="normal" error={editTouched.subjects && !!editValidationErrors.subjects}>
                <InputLabel>Subjects</InputLabel>
                <Select
                  multiple
                  value={editSubjectIds}
                  onChange={e => {
                    // Always store as array of numbers
                    const value = e.target.value;
                    setEditSubjectIds(Array.isArray(value) ? value.map(Number) : []);
                  }}
                  input={<OutlinedInput label="Subjects" />}
                  renderValue={selected => editSubjects.filter(s => selected.includes(s.id)).map(s => s.name).join(', ')}
                  disabled={editSubjects.length === 0}
                  onBlur={() => handleEditFieldBlur('subjects')}
                >
                {editSubjects.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={editSubjectIds.indexOf(option.id) > -1} />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
              {editTouched.subjects && editValidationErrors.subjects && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editValidationErrors.subjects}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveProfile} disabled={saving}>
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
        
        {/* Assignment Dialog */}
        <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{assignmentEditMode ? 'Edit Assignment' : 'Add Assignment'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              label="Title"
              fullWidth
              value={assignmentFormData.title}
              onChange={e => setAssignmentFormData({...assignmentFormData, title: e.target.value})}
              onBlur={() => handleAssignmentFieldBlur('title')}
              error={assignmentTouched.title && assignmentValidationErrors.title}
              helperText={assignmentTouched.title && assignmentValidationErrors.title}
            />
            <FormControl fullWidth margin="normal" error={assignmentTouched.subjectId && !!assignmentValidationErrors.subjectId}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={assignmentFormData.subjectId}
                onChange={e => setAssignmentFormData({...assignmentFormData, subjectId: e.target.value})}
                input={<OutlinedInput label="Subject" />}
                onBlur={() => handleAssignmentFieldBlur('subjectId')}
              >
                {profile?.subjects?.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
              {assignmentTouched.subjectId && assignmentValidationErrors.subjectId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {assignmentValidationErrors.subjectId}
                </Typography>
              )}
            </FormControl>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={e => {
                setAssignmentFormData({...assignmentFormData, file: e.target.files[0]});
                setAssignmentTouched(prev => ({ ...prev, file: true }));
              }}
              style={{ marginTop: '16px', marginBottom: '8px' }}
            />
            {assignmentFormData.file && (
              <Typography variant="body2" color="textSecondary">
                Selected file: {assignmentFormData.file.name}
              </Typography>
            )}
            {assignmentTouched.file && assignmentValidationErrors.file && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {assignmentValidationErrors.file}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleAssignmentSubmit} 
              disabled={assignmentSaving || !isAssignmentFormValid}
            >
              {assignmentSaving ? 'Saving...' : (assignmentEditMode ? 'Update' : 'Submit')}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Assignment Snackbars */}
        <Snackbar open={!!assignmentError} autoHideDuration={4000} onClose={() => setAssignmentError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setAssignmentError('')} sx={{ width: '100%' }}>{assignmentError}</Alert>
        </Snackbar>
        <Snackbar open={assignmentSuccess} autoHideDuration={3000} onClose={() => setAssignmentSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setAssignmentSuccess(false)} sx={{ width: '100%' }}>
            {assignmentEditMode ? 'Assignment updated successfully!' : 'Assignment submitted successfully!'}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
} 
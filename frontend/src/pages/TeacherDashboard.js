import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Box, Typography, Chip, FormControl, InputLabel, Select, MenuItem, Stack, Paper, ListItemText, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, OutlinedInput, Checkbox, Snackbar, Alert, IconButton, Grid, InputAdornment, LinearProgress } from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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

const validateNoteTitle = (title) => {
  if (!title) return 'Note title is required';
  if (title.length < 3) return 'Title must be at least 3 characters long';
  return '';
};

export default function TeacherDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const teacherId = user?.id;
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
  
  // Validation states for edit profile
  const [editValidationErrors, setEditValidationErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});
  const [isEditFormValid, setIsEditFormValid] = useState(false); // Used in validation
  
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
  
  // Validation states for note form
  const [noteValidationErrors, setNoteValidationErrors] = useState({});
  const [noteTouched, setNoteTouched] = useState({});
  const [isNoteFormValid, setIsNoteFormValid] = useState(false); // Used in validation
  
  // Assignment review state
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [assignmentFilterDepartmentId, setAssignmentFilterDepartmentId] = useState('');
  const [assignmentFilterSemesterId, setAssignmentFilterSemesterId] = useState('');
  const [assignmentFilterSubjectId, setAssignmentFilterSubjectId] = useState('');
  const [assignmentFilterStatus, setAssignmentFilterStatus] = useState('');
  const [assignmentFilterStudentId, setAssignmentFilterStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // const isTeacher = user?.role === 'teacher'; // Removed unused variable

  // Validate edit profile form whenever relevant fields change
  useEffect(() => {
    const errors = {};
    
    // Validate name
    const nameError = validateName(editName);
    if (nameError) errors.name = nameError;
    
    // Remove email validation - email field is now disabled
    
    // Validate department selection
    if (editDepartmentIds.length === 0) {
      errors.departments = 'Please select at least one department';
    }
    
    // Validate semester selection
    if (editSemesterIds.length === 0) {
      errors.semesters = 'Please select at least one semester';
    }
    
    // Validate subject selection
    if (editSubjectIds.length === 0) {
      errors.subjects = 'Please select at least one subject';
    }
    
    setEditValidationErrors(errors);
    setIsEditFormValid(Object.keys(errors).length === 0);
  }, [editName, editEmail, editDepartmentIds, editSemesterIds, editSubjectIds]);

  // Validate note form whenever relevant fields change
  useEffect(() => {
    const errors = {};
    
    // Validate title
    const titleError = validateNoteTitle(noteForm.title);
    if (titleError) errors.title = titleError;
    
    // Validate department selection
    if (!noteForm.departmentId) {
      errors.departmentId = 'Please select a department';
    }
    
    // Validate semester selection
    if (!noteForm.semesterId) {
      errors.semesterId = 'Please select a semester';
    }
    
    // Validate subject selection
    if (!noteForm.subjectId) {
      errors.subjectId = 'Please select a subject';
    }
    
    // Validate file (for add mode, file is required; for edit mode, either file or existing filePath)
    if (noteDialogMode === 'add' && !selectedFile && !noteForm.filePath) {
      errors.file = 'Please select a file';
    }
    
    setNoteValidationErrors(errors);
    setIsNoteFormValid(Object.keys(errors).length === 0);
  }, [noteForm.title, noteForm.departmentId, noteForm.semesterId, noteForm.subjectId, selectedFile, noteForm.filePath, noteDialogMode]);

  useEffect(() => {
    axios.get(`/teacher/${teacherId}/profile`).then(res => setProfile(res.data));
    axios.get('/departments').then(res => setDepartments(res.data));
    axios.get('/semesters').then(res => setSemesters(res.data));
    fetchStudents();
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

  // Assignment review functions
  const fetchStudents = async () => {
    try {
      const response = await axios.get('/users', { params: { role: 'student' } });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      let params = {};
      
      if (assignmentSearchTerm) params.search = assignmentSearchTerm;
      if (assignmentFilterDepartmentId) params.departmentId = assignmentFilterDepartmentId;
      if (assignmentFilterSemesterId) params.semesterId = assignmentFilterSemesterId;
      if (assignmentFilterSubjectId) params.subjectId = assignmentFilterSubjectId;
      if (assignmentFilterStatus) params.status = assignmentFilterStatus;
      if (assignmentFilterStudentId) params.studentId = assignmentFilterStudentId;

      const response = await axios.get('/assignments', { params });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, [assignmentSearchTerm, assignmentFilterDepartmentId, assignmentFilterSemesterId, assignmentFilterSubjectId, assignmentFilterStatus, assignmentFilterStudentId]);

  useEffect(() => {
    if (profile) {
      fetchAssignments();
    }
  }, [profile, assignmentSearchTerm, assignmentFilterDepartmentId, assignmentFilterSemesterId, assignmentFilterSubjectId, assignmentFilterStatus, assignmentFilterStudentId]);

  const handleDownloadAssignment = async (assignment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/download-assignment/${assignment.id}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        },
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

  const openReviewDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async (status) => {
    if (!selectedAssignment) return;

    setReviewing(true);
    setReviewError('');
    try {
      await axios.patch(`/assignments/${selectedAssignment.id}`, {
        status,
        reviewComment: reviewComment
      });
      
      setReviewSuccess(true);
      setReviewDialogOpen(false);
      setSelectedAssignment(null);
      setReviewComment('');
      
      // Refresh assignments
      fetchAssignments();
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to review assignment');
    } finally {
      setReviewing(false);
    }
  };

  // Function to fetch notes
  const fetchNotes = useCallback(async () => {
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
  }, [teacherId, searchTerm, filterDepartmentId, filterSemesterId, filterSubjectId]);

  // Function to handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setNoteValidationErrors((prev) => ({ ...prev, file: 'File size must be less than 10MB' }));
      setSelectedFile(null);
    } else {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setNoteValidationErrors((prev) => ({ ...prev, file: 'Only PDF, DOC, DOCX, and TXT files are allowed' }));
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setNoteValidationErrors((prev) => ({ ...prev, file: '' }));
      }
    }
  } else {
    setSelectedFile(null);
  }
  setNoteTouched((prev) => ({ ...prev, file: true }));
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
      setNoteValidationErrors((prev) => ({ ...prev, file: 'File upload failed. No file path returned.' }));
      return null;
    }
    return response.data.filePath;
  } catch (error) {
    setNoteValidationErrors((prev) => ({ ...prev, file: error.response?.data?.error || 'Failed to upload file' }));
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

  // Function to handle note form submission
const handleNoteSubmit = async () => {
  // Mark all fields as touched
  setNoteTouched({
    title: true,
    departmentId: true,
    semesterId: true,
    subjectId: true,
    file: true
  });
  
  // Check if form is valid
  if (!isNoteFormValid) {
    setNoteError('Please fix the validation errors before submitting');
    return;
  }
  
  let uploadedFilePath = null;
  try {
    setNoteError('');
    if (uploadingFile) return; // Prevent double submit
    let filePath = noteForm.filePath;
    // Upload file if a new file is selected
    if (selectedFile) {
      uploadedFilePath = await uploadFile();
      if (!uploadedFilePath) {
        return; // Error already set in uploadFile function
      }
      filePath = uploadedFilePath;
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
    setNoteValidationErrors({});
    setNoteTouched({});
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

  const handleEditFieldBlur = (fieldName) => {
    setEditTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleNoteFieldBlur = (fieldName) => {
    setNoteTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleEditProfile = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditDepartmentIds(profile.departments.map(d => d.id));
    setEditSemesterIds(profile.semesters.map(s => s.id));
    setEditSubjectIds(profile.subjects.map(s => s.id));
    setEditValidationErrors({});
    setEditTouched({});
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    // Mark all fields as touched
    setEditTouched({
      name: true,
      email: true,
      departments: true,
      semesters: true,
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
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundImage: 'url("https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        <Box sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
        {profile && (
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Teacher Profile</Typography>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  fontWeight: 600,
                  py: 1.2,
                  px: 2.5,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(102,126,234,0.15)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                  },
                }} 
                onClick={handleEditProfile} 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Edit Profile'}
              </Button>
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
              sx={{ 
                ml: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                fontWeight: 600,
                py: 1.2,
                px: 2.5,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(102,126,234,0.15)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }} 
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

        {/* Assignment Review Section */}
        <Accordion defaultExpanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Review Assignments</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                label="Search by Title"
                value={assignmentSearchTerm}
                onChange={e => setAssignmentSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={assignmentFilterDepartmentId}
                  onChange={e => setAssignmentFilterDepartmentId(e.target.value)}
                  input={<OutlinedInput label="Department" />}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={assignmentFilterSemesterId}
                  onChange={e => setAssignmentFilterSemesterId(e.target.value)}
                  input={<OutlinedInput label="Semester" />}
                >
                  <MenuItem value="">All Semesters</MenuItem>
                  {semesters.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={assignmentFilterSubjectId}
                  onChange={e => setAssignmentFilterSubjectId(e.target.value)}
                  input={<OutlinedInput label="Subject" />}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }} size="small">
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
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Student</InputLabel>
                <Select
                  value={assignmentFilterStudentId}
                  onChange={e => setAssignmentFilterStudentId(e.target.value)}
                  input={<OutlinedInput label="Student" />}
                >
                  <MenuItem value="">All Students</MenuItem>
                  {students.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Assignments Table */}
            {loadingAssignments ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">No assignments found</TableCell>
                      </TableRow>
                    ) : (
                      assignments.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell>{assignment.student?.name || 'N/A'}</TableCell>
                          <TableCell>{assignment.Subject?.name || 'N/A'}</TableCell>
                          <TableCell>{assignment.Department?.name || 'N/A'}</TableCell>
                          <TableCell>{assignment.Semester?.name || 'N/A'}</TableCell>
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
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleDownloadAssignment(assignment)}
                                title="Download"
                              >
                                <DownloadIcon />
                              </IconButton>
                              {assignment.status === 'pending' && (
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => openReviewDialog(assignment)}
                                  title="Review"
                                >
                                  <EditIcon />
                                </IconButton>
                              )}
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
              onBlur={() => handleEditFieldBlur('name')}
              error={editTouched.name && editValidationErrors.name}
              helperText={editTouched.name && editValidationErrors.name}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={editEmail}
              disabled
              margin="normal"
            />
                          <FormControl fullWidth margin="normal" error={editTouched.departments && !!editValidationErrors.departments}>
                <InputLabel>Departments</InputLabel>
                <Select
                  multiple
                  value={editDepartmentIds}
                  onChange={e => setEditDepartmentIds(e.target.value)}
                  onBlur={() => handleEditFieldBlur('departments')}
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
              {editTouched.departments && editValidationErrors.departments && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editValidationErrors.departments}
                </Typography>
              )}
            </FormControl>
                          <FormControl fullWidth margin="normal" error={editTouched.semesters && !!editValidationErrors.semesters}>
                <InputLabel>Semesters</InputLabel>
                <Select
                  multiple
                  value={editSemesterIds}
                  onChange={e => setEditSemesterIds(e.target.value)}
                  onBlur={() => handleEditFieldBlur('semesters')}
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
              {editTouched.semesters && editValidationErrors.semesters && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editValidationErrors.semesters}
                </Typography>
              )}
            </FormControl>
                          <FormControl fullWidth margin="normal" error={editTouched.subjects && !!editValidationErrors.subjects}>
                <InputLabel>Subjects</InputLabel>
                <Select
                  multiple
                  value={editSubjectIds}
                  onChange={e => setEditSubjectIds(e.target.value)}
                  onBlur={() => handleEditFieldBlur('subjects')}
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
              {editTouched.subjects && editValidationErrors.subjects && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editValidationErrors.subjects}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={handleSaveProfile} 
              disabled={saving || !isEditFormValid}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                fontWeight: 600,
                py: 1.2,
                px: 2.5,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(102,126,234,0.15)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
            >
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
              onBlur={() => handleNoteFieldBlur('title')}
              error={noteTouched.title && noteValidationErrors.title}
              helperText={noteTouched.title && noteValidationErrors.title}
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
              {/* File field error display */}
              {noteTouched.file && noteValidationErrors.file && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {noteValidationErrors.file}
                </Typography>
              )}
              
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
            <FormControl fullWidth margin="normal" required error={noteTouched.departmentId && !!noteValidationErrors.departmentId}>
              <InputLabel>Department</InputLabel>
              <Select
                value={noteForm.departmentId}
                onChange={(e) => setNoteForm({ ...noteForm, departmentId: e.target.value })}
                onBlur={() => handleNoteFieldBlur('departmentId')}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
              {noteTouched.departmentId && noteValidationErrors.departmentId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {noteValidationErrors.departmentId}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth margin="normal" required error={noteTouched.semesterId && !!noteValidationErrors.semesterId}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={noteForm.semesterId}
                onChange={(e) => setNoteForm({ ...noteForm, semesterId: e.target.value })}
                onBlur={() => handleNoteFieldBlur('semesterId')}
                label="Semester"
              >
                {semesters.map((sem) => (
                  <MenuItem key={sem.id} value={sem.id}>
                    {sem.name}
                  </MenuItem>
                ))}
              </Select>
              {noteTouched.semesterId && noteValidationErrors.semesterId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {noteValidationErrors.semesterId}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth margin="normal" required error={noteTouched.subjectId && !!noteValidationErrors.subjectId}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={noteForm.subjectId}
                onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                onBlur={() => handleNoteFieldBlur('subjectId')}
                label="Subject"
                disabled={!noteForm.departmentId || !noteForm.semesterId}
              >
                {formSubjects.map((subj) => (
                  <MenuItem key={subj.id} value={subj.id}>
                    {subj.name}
                  </MenuItem>
                ))}
              </Select>
              {noteTouched.subjectId && noteValidationErrors.subjectId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {noteValidationErrors.subjectId}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleNoteSubmit}
              variant="contained"
              disabled={!isNoteFormValid || uploadingFile}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                fontWeight: 600,
                py: 1.2,
                px: 2.5,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(102,126,234,0.15)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
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

        {/* Assignment Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Review Assignment</DialogTitle>
          <DialogContent>
            {selectedAssignment && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>{selectedAssignment.title}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Student: {selectedAssignment.student?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Subject: {selectedAssignment.Subject?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Submitted: {new Date(selectedAssignment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label="Review Comment (Optional)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              multiline
              rows={4}
              margin="normal"
              placeholder="Add your feedback or comments here..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => handleReviewSubmit('rejected')}
              color="error"
              disabled={reviewing}
            >
              {reviewing ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              onClick={() => handleReviewSubmit('approved')}
              variant="contained"
              disabled={reviewing}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                fontWeight: 600,
                py: 1.2,
                px: 2.5,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(102,126,234,0.15)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
            >
              {reviewing ? 'Approving...' : 'Approve'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Success/Error Snackbars */}
        <Snackbar open={!!reviewError} autoHideDuration={4000} onClose={() => setReviewError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setReviewError('')} sx={{ width: '100%' }}>{reviewError}</Alert>
        </Snackbar>
        <Snackbar open={reviewSuccess} autoHideDuration={3000} onClose={() => setReviewSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setReviewSuccess(false)} sx={{ width: '100%' }}>Assignment reviewed successfully!</Alert>
        </Snackbar>
        </Box>
      </Container>
    </Box>
  );
} 
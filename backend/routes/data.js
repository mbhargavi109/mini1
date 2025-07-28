const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Department, Semester, Subject, User, Note } = require('../models');
const { Op, Sequelize } = require('sequelize');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join('public', 'uploads', 'notes');
    // Ensure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow only PDF, DOC, DOCX, TXT files
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /departments
router.get('/departments', async (req, res) => {
  try {
    console.log('departments route hit');
    const departments = await Department.findAll();
    res.json(departments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /semesters
router.get('/semesters', async (req, res) => {
  try {
    const semesters = await Semester.findAll();
    res.json(semesters || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /teacher/:id/profile
router.get('/teacher/:id/profile', async (req, res) => {
  try {
    const teacher = await User.findByPk(req.params.id);
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ error: 'Teacher not found' });
    const departmentIds = Array.isArray(teacher.departmentIds) ? teacher.departmentIds : [];
    const semesterIds = Array.isArray(teacher.semesterIds) ? teacher.semesterIds : [];
    const departments = departmentIds.length ? await Department.findAll({ where: { id: { [Op.in]: departmentIds } } }) : [];
    const semesters = semesterIds.length ? await Semester.findAll({ where: { id: { [Op.in]: semesterIds } } }) : [];
    let subjects = [];
    if (Array.isArray(teacher.subjectIds) && teacher.subjectIds.length) {
      subjects = await Subject.findAll({ where: { id: { [Op.in]: teacher.subjectIds } } });
    } else if (departmentIds.length && semesterIds.length) {
      subjects = await Subject.findAll({ where: { DepartmentId: { [Op.in]: departmentIds }, SemesterId: { [Op.in]: semesterIds } } });
    }
    res.json({
      name: teacher.name,
      email: teacher.email,
      departments,
      semesters,
      subjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /teacher/:id/profile
router.patch('/teacher/:id/profile', async (req, res) => {
  try {
    const teacher = await User.findByPk(req.params.id);
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ error: 'Teacher not found' });
    const { name, email, departmentIds, semesterIds, subjectIds } = req.body;
    if (name !== undefined) teacher.name = name;
    if (email !== undefined) teacher.email = email;
    if (departmentIds !== undefined) teacher.departmentIds = departmentIds;
    if (semesterIds !== undefined) teacher.semesterIds = semesterIds;
    if (subjectIds !== undefined) teacher.subjectIds = subjectIds;
    await teacher.save();
    // Return updated profile in same format as GET
    const departments = Array.isArray(teacher.departmentIds) && teacher.departmentIds.length ? await Department.findAll({ where: { id: { [Op.in]: teacher.departmentIds } } }) : [];
    const semesters = Array.isArray(teacher.semesterIds) && teacher.semesterIds.length ? await Semester.findAll({ where: { id: { [Op.in]: teacher.semesterIds } } }) : [];
    let subjects = [];
    if (Array.isArray(teacher.subjectIds) && teacher.subjectIds.length) {
      subjects = await Subject.findAll({ where: { id: { [Op.in]: teacher.subjectIds } } });
    } else if (teacher.departmentIds && teacher.semesterIds && teacher.departmentIds.length && teacher.semesterIds.length) {
      subjects = await Subject.findAll({ where: { DepartmentId: { [Op.in]: teacher.departmentIds }, SemesterId: { [Op.in]: teacher.semesterIds } } });
    }
    res.json({
      name: teacher.name,
      email: teacher.email,
      departments,
      semesters,
      subjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /student/:id/profile
router.get('/student/:id/profile', async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== 'student') return res.status(404).json({ error: 'Student not found' });
    const departmentId = Array.isArray(student.departmentIds) ? student.departmentIds[0] : student.departmentIds;
    const semesterId = Array.isArray(student.semesterIds) ? student.semesterIds[0] : student.semesterIds;
    const department = departmentId ? await Department.findByPk(departmentId) : null;
    const semester = semesterId ? await Semester.findByPk(semesterId) : null;
    let subjects = [];
    if (Array.isArray(student.subjectIds) && student.subjectIds.length) {
      subjects = await Subject.findAll({ where: { id: { [Op.in]: student.subjectIds } } });
    } else if (departmentId && semesterId) {
      subjects = await Subject.findAll({ where: { DepartmentId: departmentId, SemesterId: semesterId } });
    }
    res.json({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      department,
      semester,
      subjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /student/:id/profile
router.patch('/student/:id/profile', async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== 'student') return res.status(404).json({ error: 'Student not found' });
    const { name, departmentId, semesterId, subjectIds, rollNumber } = req.body;
    if (name !== undefined) student.name = name;
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (departmentId !== undefined) student.departmentIds = [departmentId];
    if (semesterId !== undefined) student.semesterIds = [semesterId];
    if (subjectIds !== undefined) student.subjectIds = subjectIds;
    await student.save();
    // Return updated profile
    const department = departmentId ? await Department.findByPk(departmentId) : null;
    const semester = semesterId ? await Semester.findByPk(semesterId) : null;
    let subjects = [];
    if (Array.isArray(student.subjectIds) && student.subjectIds.length) {
      subjects = await Subject.findAll({ where: { id: { [Op.in]: student.subjectIds } } });
    } else if (departmentId && semesterId) {
      subjects = await Subject.findAll({ where: { DepartmentId: departmentId, SemesterId: semesterId } });
    }
    res.json({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      department,
      semester,
      subjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /subjects (optionally filtered by departmentId and semesterId)
router.get('/subjects', async (req, res) => {
  try {
    const { departmentId, semesterId } = req.query;
    const where = {};
    if (departmentId) where.DepartmentId = Number(departmentId);
    if (semesterId) where.SemesterId = Number(semesterId);
    const subjects = await Subject.findAll({ where });
    res.json(subjects || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notes (with filters)
router.get('/notes', async (req, res) => {
  try {
    const { teacherId, subjectId, departmentId, semesterId, search } = req.query;
    const filters = [];
    if (teacherId) filters.push({ teacherId: Number(teacherId) });
    if (subjectId) filters.push({ SubjectId: Number(subjectId) });
    if (departmentId) filters.push({ DepartmentId: Number(departmentId) });
    if (semesterId) filters.push({ SemesterId: Number(semesterId) });
    if (search) {
      filters.push(
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('title')),
          {
            [Op.like]: `%${search.toLowerCase()}%`
          }
        )
      );
    }
    const where = filters.length > 0 ? { [Op.and]: filters } : {};
    const notes = await Note.findAll({
      where,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: Subject, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] },
        { model: Semester, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(notes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notes/:id
router.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: Subject, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] },
        { model: Semester, attributes: ['id', 'name'] }
      ]
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /upload-file
router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = `uploads/notes/${req.file.filename}`;
    console.log('File uploaded:', filePath);
    res.json({ 
      filePath,
      originalName: req.file.originalname,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /notes
router.post('/notes', async (req, res) => {
  try {
    const { title, filePath, teacherId, subjectId, departmentId, semesterId } = req.body;
    
    if (!title || !filePath || !teacherId || !subjectId || !departmentId || !semesterId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const note = await Note.create({
      title,
      filePath,
      teacherId: Number(teacherId),
      SubjectId: Number(subjectId),
      DepartmentId: Number(departmentId),
      SemesterId: Number(semesterId)
    });

    const createdNote = await Note.findByPk(note.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: Subject, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] },
        { model: Semester, attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json(createdNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /notes/:id
router.put('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { title, filePath, subjectId, departmentId, semesterId } = req.body;
    
    if (title !== undefined) note.title = title;
    if (filePath !== undefined) {
      // Delete old file if it exists and is different
      if (note.filePath && note.filePath !== filePath) {
        const oldFilePath = path.join(__dirname, '..', 'public', note.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      note.filePath = filePath;
    }
    if (subjectId !== undefined) note.SubjectId = Number(subjectId);
    if (departmentId !== undefined) note.DepartmentId = Number(departmentId);
    if (semesterId !== undefined) note.SemesterId = Number(semesterId);

    await note.save();

    const updatedNote = await Note.findByPk(note.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: Subject, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] },
        { model: Semester, attributes: ['id', 'name'] }
      ]
    });

    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /notes/:id
router.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete the file if it exists
    if (note.filePath) {
      const filePath = path.join(__dirname, '..', 'public', note.filePath);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        // Log file deletion error but continue to delete the note
        console.error('Error deleting file:', fileErr);
      }
    }

    await note.destroy();
    res.json({ message: 'Note and file deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /delete-uploaded-file
router.post('/delete-uploaded-file', async (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'No filePath provided' });
  const fullPath = path.join(__dirname, '..', 'public', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return res.json({ message: 'File deleted' });
  }
  res.status(404).json({ error: 'File not found' });
});

// Download note file by note ID
router.get('/download-note/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note || !note.filePath) {
      return res.status(404).json({ error: 'Note or file not found' });
    }
    const filePath = path.join(__dirname, '..', 'public', note.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    // Use originalName if available, otherwise fallback to file name
    const originalName = note.title ? `${note.title}${path.extname(filePath)}` : path.basename(filePath);
    res.download(filePath, originalName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
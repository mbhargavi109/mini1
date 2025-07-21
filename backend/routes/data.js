const express = require('express');
const { Department, Semester, Subject, User } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

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
    // Assume departmentIds and semesterIds are stored as arrays on the user
    const departmentIds = Array.isArray(teacher.departmentIds) ? teacher.departmentIds : [];
    const semesterIds = Array.isArray(teacher.semesterIds) ? teacher.semesterIds : [];
    const departments = departmentIds.length ? await Department.findAll({ where: { id: { [Op.in]: departmentIds } } }) : [];
    const semesters = semesterIds.length ? await Semester.findAll({ where: { id: { [Op.in]: semesterIds } } }) : [];
    // Subjects for these departments and semesters
    let subjects = [];
    if (departmentIds.length && semesterIds.length) {
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
    if (teacher.departmentIds && teacher.semesterIds && teacher.departmentIds.length && teacher.semesterIds.length) {
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
    if (departmentId && semesterId) {
      subjects = await Subject.findAll({ where: { DepartmentId: departmentId, SemesterId: semesterId } });
    }
    res.json({
      name: student.name,
      email: student.email,
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
    const { name, departmentId, semesterId, subjectIds } = req.body;
    if (name !== undefined) student.name = name;
    if (departmentId !== undefined) student.departmentIds = [departmentId];
    if (semesterId !== undefined) student.semesterIds = [semesterId];
    if (subjectIds !== undefined) student.subjectIds = subjectIds;
    await student.save();
    // Return updated profile
    const department = departmentId ? await Department.findByPk(departmentId) : null;
    const semester = semesterId ? await Semester.findByPk(semesterId) : null;
    let subjects = [];
    if (departmentId && semesterId) {
      subjects = await Subject.findAll({ where: { DepartmentId: departmentId, SemesterId: semesterId } });
    }
    res.json({
      name: student.name,
      email: student.email,
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

module.exports = router; 
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
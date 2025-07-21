const express = require('express');
const { Department, Semester, Subject, User } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

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

module.exports = router; 
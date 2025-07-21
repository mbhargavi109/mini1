const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Department, Semester } = require('../models');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, departmentIds, semesterIds, subjectIds, rollNumber } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    // Associations (for demo, just store IDs as JSON fields if needed)
    // In production, use proper join tables for many-to-many
    user.departmentIds = departmentIds;
    user.semesterIds = semesterIds;
    user.subjectIds = subjectIds;
    if (role === 'student' && rollNumber) {
      user.rollNumber = rollNumber;
    }
    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router; 
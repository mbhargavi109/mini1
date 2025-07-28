const { sequelize, Department, Semester, Subject, User, Note } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  // Departments
  const cs = await Department.create({ name: 'Computer Science' });
  const mech = await Department.create({ name: 'Mechanical' });
  const eee = await Department.create({ name: 'Electrical' });

  // Semesters
  const sem1 = await Semester.create({ name: 'Semester 1' });
  const sem2 = await Semester.create({ name: 'Semester 2' });
  const sem3 = await Semester.create({ name: 'Semester 3' });

  // Subjects
  const math = await Subject.create({ name: 'Mathematics', DepartmentId: cs.id, SemesterId: sem1.id });
  const prog = await Subject.create({ name: 'Programming', DepartmentId: cs.id, SemesterId: sem1.id });
  const thermo = await Subject.create({ name: 'Thermodynamics', DepartmentId: mech.id, SemesterId: sem2.id });
  const circuits = await Subject.create({ name: 'Circuits', DepartmentId: eee.id, SemesterId: sem3.id });

  // Users (Teachers)
  const teacher1 = await User.create({ 
    name: 'Dr. John Smith', 
    email: 'john.smith@university.edu', 
    password: 'password123',
    role: 'teacher',
    departmentIds: [cs.id],
    semesterIds: [sem1.id],
    subjectIds: [math.id, prog.id]
  });

  const teacher2 = await User.create({ 
    name: 'Prof. Jane Doe', 
    email: 'jane.doe@university.edu', 
    password: 'password123',
    role: 'teacher',
    departmentIds: [mech.id, eee.id],
    semesterIds: [sem2.id, sem3.id],
    subjectIds: [thermo.id, circuits.id]
  });

  // Sample Notes
  await Note.create({
    title: 'Introduction to Calculus',
    filePath: '/uploads/notes/sample-calculus-intro.pdf',
    teacherId: teacher1.id,
    SubjectId: math.id,
    DepartmentId: cs.id,
    SemesterId: sem1.id
  });

  await Note.create({
    title: 'Python Programming Basics',
    filePath: '/uploads/notes/sample-python-basics.pdf',
    teacherId: teacher1.id,
    SubjectId: prog.id,
    DepartmentId: cs.id,
    SemesterId: sem1.id
  });

  await Note.create({
    title: 'Thermodynamics Fundamentals',
    filePath: '/uploads/notes/sample-thermo-fundamentals.pdf',
    teacherId: teacher2.id,
    SubjectId: thermo.id,
    DepartmentId: mech.id,
    SemesterId: sem2.id
  });

  await Note.create({
    title: 'Electrical Circuit Analysis',
    filePath: '/uploads/notes/sample-circuit-analysis.pdf',
    teacherId: teacher2.id,
    SubjectId: circuits.id,
    DepartmentId: eee.id,
    SemesterId: sem3.id
  });

  console.log('Seeded sample data!');
  process.exit();
}

seed(); 
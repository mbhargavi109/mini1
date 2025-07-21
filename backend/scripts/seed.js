const { sequelize, Department, Semester, Subject } = require('../models');

async function seed() {
  await sequelize.sync({ alter: true });

  // Departments
  const cs = await Department.create({ name: 'Computer Science' });
  const mech = await Department.create({ name: 'Mechanical' });
  const eee = await Department.create({ name: 'Electrical' });

  // Semesters
  const sem1 = await Semester.create({ name: 'Semester 1' });
  const sem2 = await Semester.create({ name: 'Semester 2' });
  const sem3 = await Semester.create({ name: 'Semester 3' });

  // Subjects
  await Subject.create({ name: 'Mathematics', DepartmentId: cs.id, SemesterId: sem1.id });
  await Subject.create({ name: 'Programming', DepartmentId: cs.id, SemesterId: sem1.id });
  await Subject.create({ name: 'Thermodynamics', DepartmentId: mech.id, SemesterId: sem2.id });
  await Subject.create({ name: 'Circuits', DepartmentId: eee.id, SemesterId: sem3.id });

  console.log('Seeded sample data!');
  process.exit();
}

seed(); 
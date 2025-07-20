const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Department = require('./Department')(sequelize);
const Semester = require('./Semester')(sequelize);
const Subject = require('./Subject')(sequelize);
const Note = require('./Note')(sequelize);
const Assignment = require('./Assignment')(sequelize);
const Review = require('./Review')(sequelize);

// Associations
Subject.belongsTo(Department);
Subject.belongsTo(Semester);

Note.belongsTo(User, { as: 'teacher' });
Note.belongsTo(Subject);
Note.belongsTo(Department);
Note.belongsTo(Semester);

Assignment.belongsTo(User, { as: 'student' });
Assignment.belongsTo(Subject);
Assignment.belongsTo(Department);
Assignment.belongsTo(Semester);

Review.belongsTo(Assignment);
Review.belongsTo(User, { as: 'teacher' });

module.exports = {
  sequelize,
  User,
  Department,
  Semester,
  Subject,
  Note,
  Assignment,
  Review,
}; 
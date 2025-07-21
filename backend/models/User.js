const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher'),
      allowNull: false,
    },
    rollNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    semesterIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    subjectIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  });
  return User;
}; 
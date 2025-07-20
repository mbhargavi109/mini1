const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Semester = sequelize.define('Semester', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });
  return Semester;
}; 
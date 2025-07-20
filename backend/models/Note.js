const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Note;
}; 
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });
  return Review;
}; 
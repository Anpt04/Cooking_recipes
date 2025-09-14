// src/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    user_id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255), 
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'), 
      defaultValue: "user",
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
    },
    avatar_url: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "users",
    timestamps: false,
  });

  return User;
};

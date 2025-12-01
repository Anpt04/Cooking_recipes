module.exports = (sequelize, DataTypes) => {
  const Rate = sequelize.define("Rate", {
    rate_id: {
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    user_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
    recipe_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
    rating: { 
        type: DataTypes.INTEGER, 
        validate: { min: 1, max: 5 } 
    },
    comment: { 
        type: DataTypes.TEXT 
    },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: "rate",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,         
  });

  return Rate;
};

module.exports = (sequelize, DataTypes) => {
  const Rate = sequelize.define("Rate", {
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
    timestamps: false,
  });

  return Rate;
};

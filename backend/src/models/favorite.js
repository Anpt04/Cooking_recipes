module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define("Favorite", {
    user_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
    recipe_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
  }, {
    tableName: "favorite",
    timestamps: false,
  });

  return Favorite;
};

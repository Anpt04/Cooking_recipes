module.exports = (sequelize, DataTypes) => {
  const ShoppingList = sequelize.define("ShoppingList", {
    list_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: "shopping_list",
    timestamps: false,
  });

  return ShoppingList;
};

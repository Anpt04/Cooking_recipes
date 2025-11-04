module.exports = (sequelize, DataTypes) => {
  const ShoppingListItem = sequelize.define("ShoppingListItem", {
    item_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    list_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    ingredient_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    quantity: { 
        type: DataTypes.STRING(50) 
    },
    is_checked: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
  }, {
    tableName: "shopping_list_item",
    timestamps: false,
  });

  return ShoppingListItem;
};

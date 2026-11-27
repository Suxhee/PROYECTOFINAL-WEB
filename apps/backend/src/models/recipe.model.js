import { DataTypes } from 'sequelize';
export const defineRecipe = (sequelize) => sequelize.define('Recipe', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  inputName: { type: DataTypes.STRING(150), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, validate: { min: 0.001 } },
  unit: { type: DataTypes.STRING(30), allowNull: false },
}, { tableName: 'recipes', timestamps: true });

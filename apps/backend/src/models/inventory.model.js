import { DataTypes } from 'sequelize';
export const defineInventory = (sequelize) => sequelize.define('Inventory', {
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
  minimumQuantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
  unit: { type: DataTypes.STRING(30), allowNull: false },
}, { tableName: 'inventory', timestamps: true });

import { DataTypes } from 'sequelize';
export const definePurchase = (sequelize) => sequelize.define('Purchase', {
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  supplierName: { type: DataTypes.STRING(180), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
}, { tableName: 'purchases', timestamps: true });

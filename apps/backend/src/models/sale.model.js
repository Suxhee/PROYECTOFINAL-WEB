import { DataTypes } from 'sequelize';
export const defineSale = (sequelize) => sequelize.define('Sale', {
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
}, { tableName: 'sales', timestamps: true });

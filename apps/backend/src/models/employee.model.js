import { DataTypes } from 'sequelize';
export const defineEmployee = (sequelize) => sequelize.define('Employee', {
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  fullName: { type: DataTypes.STRING(180), allowNull: false },
  dui: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'employees', timestamps: true });

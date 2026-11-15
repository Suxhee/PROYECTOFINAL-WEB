import { DataTypes } from 'sequelize';
export const defineUser = (sequelize) => sequelize.define('User', {
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(40), allowNull: false },
}, { tableName: 'users', timestamps: true });

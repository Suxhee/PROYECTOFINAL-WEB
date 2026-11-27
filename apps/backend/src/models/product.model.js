import { DataTypes } from 'sequelize';
export const defineProduct = (sequelize) => sequelize.define('Product', {
  name: { type: DataTypes.STRING(150), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'products', timestamps: true });

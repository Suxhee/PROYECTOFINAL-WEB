import { sequelize } from '../config/database.js';
import { defineEmployee } from './employee.model.js';
import { defineInventory } from './inventory.model.js';
import { defineProduct } from './product.model.js';
import { definePurchase } from './purchase.model.js';
import { defineRecipe } from './recipe.model.js';
import { defineSale } from './sale.model.js';
import { defineUser } from './user.model.js';

export const User = defineUser(sequelize);
export const Product = defineProduct(sequelize);
export const Recipe = defineRecipe(sequelize);
export const Inventory = defineInventory(sequelize);
export const Sale = defineSale(sequelize);
export const Purchase = definePurchase(sequelize);
export const Employee = defineEmployee(sequelize);

Product.hasMany(Recipe, { foreignKey: 'productId' });
Recipe.belongsTo(Product, { foreignKey: 'productId' });
export { sequelize };

// models/inventoryStockModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Product from './product.js';

const InventoryStock = sequelize.define('InventoryStock', {
  product_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    references: {
      model: Product,
      key: 'id'
    }
  },
  stock_on_hand: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reserved: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'inventory_stock',
  timestamps: false
});

// Product.hasOne(InventoryStock, { foreignKey: 'product_id' });
// InventoryStock.belongsTo(Product, { foreignKey: 'product_id' });

export default InventoryStock;

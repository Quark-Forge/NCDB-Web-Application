// models/inventoryTransactionModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Product from './product.js';

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('RECEIVE', 'SHIP', 'ADJUST'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING
  },
  reference: {
    type: DataTypes.STRING
  },
  note: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory_transactions',
  timestamps: false
});

// Product.hasMany(InventoryTransaction, { foreignKey: 'product_id' });
// InventoryTransaction.belongsTo(Product, { foreignKey: 'product_id' });

export default InventoryTransaction;

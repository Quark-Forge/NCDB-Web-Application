import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Order from "./orders.js";
import Product from "./product.js";
import Supplier from "./suppliers.js";

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Order,
      key: 'id',
    },
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  supplier_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Supplier,
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
  paranoid: true,
});



export default OrderItem;

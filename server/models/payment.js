import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Orders from "./orders.js";

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Orders,
      key: 'id',
    },
  },
  payment_method: {
    type: DataTypes.ENUM('cash_on_delivery', 'credit_card', 'bank_transfer', 'paypal'),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

export default Payment;

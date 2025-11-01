import { DataTypes } from "sequelize";

export default (sequelize) => {
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
        model: 'orders', // Changed to string reference
        key: 'id',
      },
    },
    payment_method: {
      type: DataTypes.ENUM('cash_on_delivery', 'credit_card', 'bank_transfer', 'paypal', 'digital_wallet'),
      allowNull: false,
      validate: {
        notContains: {
          args: ' ',
          msg: 'Payment method cannot contain spaces'
        }
      }
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isValidDate(value) {
          if (value && value > new Date()) {
            throw new Error('Payment date cannot be in the future');
          }
        }
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01 // More realistic than 0
      },
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        len: [6, 100]
      }
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'RESTRICT', // Prevent payment deletion if order exists
      as : 'order'
    });
  };

  return Payment;
}
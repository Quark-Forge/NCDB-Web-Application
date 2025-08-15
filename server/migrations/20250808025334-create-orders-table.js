'use strict';

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('orders', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    order_number: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    shipping_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    shipping_phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    shipping_address_line1: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    shipping_address_line2: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    shipping_city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    billing_address_same: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    billing_address: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    total_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    order_date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    delivery_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    payment_method: {
      type: Sequelize.ENUM('cash', 'card', 'bank_transfer'),
      allowNull: false,
      defaultValue: 'cash',
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Drop ENUM type in Postgres/MySQL to avoid issues
  await queryInterface.dropTable('orders');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
};

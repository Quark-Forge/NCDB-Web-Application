'use strict';

/** @type {import('sequelize-cli').Migration} */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('payments', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    order_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    payment_method: {
      type: Sequelize.ENUM('cash_on_delivery', 'credit_card', 'bank_transfer', 'paypal'),
      allowNull: false,
    },
    payment_status: {
      type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
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
  await queryInterface.dropTable('payments');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_payment_method";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_payment_status";');
};

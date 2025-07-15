'use strict';

/** @type {import('sequelize-cli').Migration} */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('products', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity_per_unit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    unit_symbol: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    sku: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    image_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    category_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('products');
};
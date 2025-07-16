'use strict';

/** @type {import('sequelize-cli').Migration} */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('supplier_items', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    stock_level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    supplier_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'suppliers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'products',
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
  });

  await queryInterface.addIndex('supplier_items', ['supplier_id', 'product_id'], {
    unique: true,
    name: 'supplier_product_unique_index',
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('supplier_items');
};

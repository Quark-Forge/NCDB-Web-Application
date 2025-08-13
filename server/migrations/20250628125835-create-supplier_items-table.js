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
    supplier_sku: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 }
    },
    purchase_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 }
    },
    discount_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    },
    expiry_days: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    quantity_per_unit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    unit_symbol: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    image_url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    stock_level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lead_time_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 7
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    supplier_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'suppliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    product_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('supplier_items');
};

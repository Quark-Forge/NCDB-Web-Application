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
    sku: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    base_image_url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    category_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
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
  await queryInterface.dropTable('products');
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      shipping_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      shipping_phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      address_line1: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      address_line2: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
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
      shipping_cost_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shipping_costs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('addresses');
  }
};

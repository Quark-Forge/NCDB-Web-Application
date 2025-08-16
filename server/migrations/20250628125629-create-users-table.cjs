'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
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
      email: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      contact_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
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
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};

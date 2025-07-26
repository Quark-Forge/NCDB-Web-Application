'use strict';

/** @type {import('sequelize-cli').Migration} */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('carts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('carts');
};


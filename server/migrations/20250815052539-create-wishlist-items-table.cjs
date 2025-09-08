'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wishlist_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      wishlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'wishlists',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      supplier_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'supplierItem',
          key: 'id'
        }
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

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.dropTable('wishlist_items');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('supplier_item_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      supplier_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'supplier_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      urgency: {
        type: Sequelize.ENUM('high', 'medium', 'low'),
        allowNull: false,
        defaultValue: 'medium'
      },
      notes_from_requester: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      supplier_quote: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      notes_from_supplier: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('supplier_item_requests');

    // Remove the ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_supplier_item_requests_urgency";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_supplier_item_requests_status";'
    );
  }
};
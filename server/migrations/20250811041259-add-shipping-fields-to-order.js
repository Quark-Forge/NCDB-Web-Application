'use strict';

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('orders', 'shipping_name', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '' // Temporary default for existing records
  });

  await queryInterface.addColumn('orders', 'shipping_phone', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  });

  await queryInterface.addColumn('orders', 'shipping_address_line1', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  });

  await queryInterface.addColumn('orders', 'shipping_address_line2', {
    type: Sequelize.STRING,
    allowNull: true
  });

  await queryInterface.addColumn('orders', 'shipping_city', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  });

  await queryInterface.addColumn('orders', 'billing_address_same', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  });

  await queryInterface.addColumn('orders', 'billing_address', {
    type: Sequelize.JSON,
    allowNull: true
  });

  // Update existing records to replace empty defaults with NULL where appropriate
  await queryInterface.sequelize.query(`
    UPDATE orders SET 
      shipping_address_line2 = NULL 
    WHERE shipping_address_line2 = ''
  `);
};

export const down = async (queryInterface, Sequelize) => {
  const columnsToRemove = [
    'shipping_name',
    'shipping_phone',
    'shipping_address_line1',
    'shipping_address_line2',
    'shipping_city',
    'billing_address_same',
    'billing_address'
  ];

  for (const column of columnsToRemove) {
    await queryInterface.removeColumn('orders', column);
  }
};
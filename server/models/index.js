import sequelize from "../config/db.js";

import Role from "./roles.js";
import User from "./users.js";
import Cart from "./cart.js";
import CartItem from "./cartItems.js";
import Product from "./product.js";
import Category from "./category.js";
import Supplier from "./suppliers.js";
import SupplierItem from "./suplierItem.js"
import Order from "./orders.js";
import OrderItem from "./orderItems.js";
import Payment from "./payment.js";
import InventoryStock from "./inventoryStock.js";
import InventoryTransaction from "./inventoryTransaction.js";

// User <-> Role
User.belongsTo(Role, {
  foreignKey: 'role_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});
Role.hasMany(User, {
  foreignKey: 'role_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

// Product<-> Category
Product.belongsTo(Category, {
  foreignKey: 'category_id'
});
Category.hasMany(Product, {
  foreignKey: 'category_id'
});

// Cart <-> User
Cart.belongsTo(User, {
  foreignKey: 'user_id',
});
User.hasOne(Cart, {
  foreignKey: 'user_id',
});

// Cart <-> CartItem <-> Product
Cart.hasMany(CartItem, {
  foreignKey: 'cart_id',
  onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id',
});

CartItem.belongsTo(Product, {
  foreignKey: 'product_id',
});
Product.hasMany(CartItem, {
  foreignKey: 'product_id',
});

// SupplierItem <-> Supplier & Product
SupplierItem.belongsTo(Supplier, {
  foreignKey: 'supplier_id'
});
Supplier.hasMany(SupplierItem, {
  foreignKey: 'supplier_id'
});

SupplierItem.belongsTo(Product, {
  foreignKey: 'product_id'
});
Product.hasMany(SupplierItem, {
  foreignKey: 'product_id'
});

// OrderItem <-> Order & User
Order.belongsTo(User, {
  foreignKey: 'user_id'
});
Order.hasMany(OrderItem, {
  foreignKey: 'order_id'
});


OrderItem.belongsTo(Order, {
  foreignKey: 'order_id'
});
OrderItem.belongsTo(Product, {
  foreignKey: 'product_id'
});

// Payment <-> Order
Order.hasOne(Payment, {
  foreignKey: 'order_id'
});

Payment.belongsTo(Order, { 
  foreignKey: 'order_id' 
});
// InventoryStock <-> Product
Product.hasOne(InventoryStock, { foreignKey: 'product_id' });
InventoryStock.belongsTo(Product, { foreignKey: 'product_id' });

// InventoryTransaction <-> Product
Product.hasMany(InventoryTransaction, { foreignKey: 'product_id' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'product_id' });

export {
  sequelize,
  Role,
  User,
  Cart,
  CartItem,
  Product,
  Category,
  Supplier,
  SupplierItem,
  Order,
  OrderItem,
  InventoryStock,
  InventoryTransaction
};

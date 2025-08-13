import sequelize from "../config/db.js";
import Role from "./roles.js";
import User from "./users.js";
import Cart from "./cart.js";
import CartItem from "./cartItems.js";
import Product from "./product.js";
import Category from "./category.js";
import Supplier from "./suppliers.js";
import Order from "./orders.js";
import OrderItem from "./orderItems.js";
import Payment from "./payment.js";
import SupplierItem from "./suplierItem.js";

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

// Product <-> Category
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  onDelete: 'RESTRICT'
});
Category.hasMany(Product, {
  foreignKey: 'category_id'
});

// Cart <-> User
Cart.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
User.hasOne(Cart, {
  foreignKey: 'user_id'
});

// Cart <-> CartItem <-> Product
Cart.hasMany(CartItem, {
  foreignKey: 'cart_id',
  onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id'
});
CartItem.belongsTo(Product, {
  foreignKey: 'product_id',
  onDelete: 'RESTRICT'
});
Product.hasMany(CartItem, {
  foreignKey: 'product_id'
});

// CartItem <-> Supplier
CartItem.belongsTo(Supplier, {
  foreignKey: 'supplier_id',
  onDelete: 'RESTRICT'
});
Supplier.hasMany(CartItem, {
  foreignKey: 'supplier_id'
});

// Product <-> Supplier (Many-to-Many through SupplierItem)
Product.belongsToMany(Supplier, {
  through: SupplierItem,
  foreignKey: 'product_id',
  as: 'ProductSuppliers'  // Unique alias for the many-to-many
});
Supplier.belongsToMany(Product, {
  through: SupplierItem,
  foreignKey: 'supplier_id',
  as: 'SupplierProducts'  // Unique alias for the many-to-many
});

// Explicit one-to-many relationships for eager loading
Product.hasMany(SupplierItem, {
  foreignKey: 'product_id',
  as: 'SupplierItems'  // Consistent alias for one-to-many
});
SupplierItem.belongsTo(Product, {
  foreignKey: 'product_id'
});

Supplier.hasMany(SupplierItem, {
  foreignKey: 'supplier_id',
  as: 'SupplierProductsItems'  // Unique alias
});
SupplierItem.belongsTo(Supplier, {
  foreignKey: 'supplier_id'
});

// Order Relationships
Order.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'RESTRICT'
});
User.hasMany(Order, {
  foreignKey: 'user_id'
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id'
});
OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  onDelete: 'RESTRICT'
});

OrderItem.belongsTo(Supplier, {
    foreignKey: 'supplier_id',
});
Supplier.hasMany(OrderItem, {
    foreignKey: 'supplier_id'
});

// Payment
Order.hasOne(Payment, {
  foreignKey: 'order_id',
  onDelete: 'CASCADE'
});
Payment.belongsTo(Order, {
  foreignKey: 'order_id'
});

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
  Payment,
};
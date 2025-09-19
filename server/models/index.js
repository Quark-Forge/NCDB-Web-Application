import sequelize from "../config/db.js";
import RoleModel from "./roles.js";
import UserModel from "./users.js";
import CartModel from "./cart.js";
import CartItemModel from "./cartItems.js";
import ProductModel from "./product.js";
import CategoryModel from "./category.js";
import SupplierModel from "./suppliers.js";
import ShippingCostModel from "./shippingCost.js";
import AddressModel from "./address.js";
import OrderModel from "./orders.js";
import OrderItemModel from "./orderItems.js";
import PaymentModel from "./payment.js";
import SupplierItemModel from "./suplierItem.js";
import WishlistModel from "./wishlist.js";
import WishlistItemModel from "./wishlistItem.js";
import SupplierItemRequestModel from "./supplier_item_requests.js";


export const Role = RoleModel(sequelize);
export const User = UserModel(sequelize);
export const Product = ProductModel(sequelize);
export const Category = CategoryModel(sequelize);
export const Supplier = SupplierModel(sequelize);
export const Wishlist = WishlistModel(sequelize);
export const WishlistItem = WishlistItemModel(sequelize);
export const Cart = CartModel(sequelize);
export const CartItem = CartItemModel(sequelize);
export const ShippingCost = ShippingCostModel(sequelize);
export const Address = AddressModel(sequelize);
export const Order = OrderModel(sequelize);
export const OrderItem = OrderItemModel(sequelize);
export const Payment = PaymentModel(sequelize);
export const SupplierItem = SupplierItemModel(sequelize);
export const SupplierItemRequest = SupplierItemRequestModel(sequelize);





const models = {
  Role,
  User,
  Cart,
  CartItem,
  Product,
  Category,
  Supplier,
  SupplierItem,
  ShippingCost,
  Address,
  Order,
  OrderItem,
  Payment,
  Wishlist,
  WishlistItem,
  SupplierItemRequest,
};

// Initialize associations if they exist
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export all models AND sequelize instance
export { sequelize };
export default models;
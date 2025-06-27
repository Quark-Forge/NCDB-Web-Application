import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./category.js";
import Supplier from "./suppliers.js";

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: false,
    },
    description: {
        type: DataTypes.TEXT,
        unique: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        unique: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: false,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Supplier,
            key: 'id'
        }
    },

}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
});

Product.belongsTo(Category, { foreignKey: 'category_id' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id' });

export default Product;
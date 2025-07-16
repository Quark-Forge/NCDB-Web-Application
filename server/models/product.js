import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./category.js";
import Supplier from "./suppliers.js";

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    discount_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        unique: false,
    },
    quantity_per_unit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        unique: false,
    },
    unit_symbol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: false,
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: false,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
    }, 
    category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    },

}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
});

Product.belongsTo(Category, { foreignKey: 'category_id' });

export default Product;
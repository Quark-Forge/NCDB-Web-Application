import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import Supplier from "./suppliers.js";
import Product from "./product.js";

const SupplierItem = sequelize.define('SupplierItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    stock_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        unique: false,
    },
    supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Supplier,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
}, {

    tableName: 'supplier_items',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ['supplier_id', 'product_id']
        }
    ]
});

SupplierItem.belongsTo(Product, { foreignKey: 'product_id' });
SupplierItem.belongsTo(Supplier, { foreignKey: 'supplier_id' });

Supplier.hasMany(SupplierItem, { foreignKey: 'supplier_id' });
Product.hasMany(SupplierItem, { foreignKey: 'product_id' });

export default SupplierItem;
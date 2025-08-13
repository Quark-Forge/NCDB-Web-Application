import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./category.js";


const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Product name cannot be empty"
            },
            len: {
                args: [2, 100],
                msg: "Product name must be 2-100 characters"
            }
        }
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: "SKU cannot be empty"
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    base_image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: {
                msg: "Invalid image URL format",
                protocols: ['http', 'https'],
                require_protocol: true
            }
        }
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    paranoid: true,
    hooks: {
        afterUpdate: async (product) => {
            if (product.changed('base_image_url')) {
                await sequelize.models.SupplierItem.update(
                    { image_url: product.base_image_url },
                    { where: { product_id: product.id, image_url: null } }
                );
            }
        }
    },
    indexes: [
        {
            fields: ['category_id']
        },
        {
            fields: ['sku'],
            unique: true
        }
    ]
});

export default Product;
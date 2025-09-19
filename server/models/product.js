import { DataTypes } from "sequelize";

export default (sequelize) => {
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
                },
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: [0, 2000]
            }
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
                model: 'categories',
                key: 'id'
            }
        },

    }, {
        tableName: 'products',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Product.associate = (models) => {
        Product.belongsTo(models.Category, {
            foreignKey: 'category_id',
            onDelete: 'RESTRICT'
        });

        Product.hasMany(models.CartItem, {
            foreignKey: 'product_id',
        });
        
        Product.hasMany(models.OrderItem, {
            foreignKey: 'product_id',
            onDelete: 'RESTRICT'
        });

        Product.belongsToMany(models.Supplier, {
            through: models.SupplierItem,
            foreignKey: 'product_id',
        });

        Product.hasMany(models.SupplierItem, {
            foreignKey: 'product_id',
        });
    };

    return Product;
}
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const SupplierItem = sequelize.define('SupplierItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        supplier_sku: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Supplier SKU cannot be empty"
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "Price must be at least 0.01"
                }
            }
        },
        purchase_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "Purchase price must be at least 0.01"
                }
            }
        },
        discount_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                isLessThanPrice(value) {
                    if (value && parseFloat(value) >= parseFloat(this.price)) {
                        throw new Error('Discount price must be lower than regular price');
                    }
                }
            }
        },
        expiry_days: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        quantity_per_unit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "Quantity per unit must be positive"
                }
            }
        },
        unit_symbol: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Unit symbol cannot be empty"
                }
            }
        },
        image_url: {
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
        stock_level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        lead_time_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7,
            validate: {
                min: 0
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'suppliers',
                key: 'id'
            }
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        }
    }, {
        tableName: 'supplier_items',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    SupplierItem.associate = (models) => {
        SupplierItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
        });

        SupplierItem.belongsTo(models.Supplier, {
            foreignKey: 'supplier_id',
        });
    };

    return SupplierItem;
}
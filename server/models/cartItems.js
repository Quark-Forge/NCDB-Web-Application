import { DataTypes } from "sequelize";

export default (sequelize) => {
    const CartItem = sequelize.define('CartItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        cart_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'carts',
                key: 'id'
            },
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            },
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'suppliers',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: { min: 1 }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0.01 }
        }
    }, {
        tableName: 'cart_items',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    CartItem.associate = (models) => {
        CartItem.belongsTo(models.Cart, {
            foreignKey: 'cart_id',
        });
        CartItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
        });
        CartItem.belongsTo(models.Supplier, {
            foreignKey: 'supplier_id',
            onDelete: 'RESTRICT'
        });
    };

    return CartItem;
}
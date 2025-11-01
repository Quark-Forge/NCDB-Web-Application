import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users', // Use string to prevent circular imports
                key: 'id'
            }
        },
        address_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'addresses',
                key: 'id'
            }
        },
        order_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0.01
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'),
            allowNull: false,
            defaultValue: 'pending'
        },
        order_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        delivery_date: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isAfterOrderDate(value) {
                    if (value && value < this.order_date) {
                        throw new Error('Delivery date must be after order date');
                    }
                }
            }
        },

    }, {
        tableName: 'orders',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, {
            foreignKey: 'user_id',
        });

        Order.hasMany(models.OrderItem, {
            foreignKey: 'order_id',
            onDelete: 'CASCADE'
        });

        Order.belongsTo(models.Address, {
            foreignKey: 'address_id',
        });

        Order.hasOne(models.Payment, {
            foreignKey: 'order_id',
            onDelete: 'CASCADE',
            as: 'payment'
        });

    };

    return Order;
}
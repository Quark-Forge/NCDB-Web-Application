import { DataTypes } from "sequelize";

export default (sequelize) => {
    const ShippingCost = sequelize.define('ShippingCost', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        city: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0.01 // More realistic than 0
            },
        },
        estimated_delivery_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1 // At least one day for delivery
            }
        }
    }, {
        tableName: 'shipping_costs',
        timestamps: true,
    });
    
    return ShippingCost;
}
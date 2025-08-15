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
        estimated_delivery_date: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: true,
                isValidDate(value) {
                    if (value && value < new Date()) {
                        throw new Error('Estimated delivery date cannot be in the past');
                    }
                }
            }
        }
    }, {
        tableName: 'shipping_costs',
        timestamps: true,
    });
    
    return ShippingCost;
}
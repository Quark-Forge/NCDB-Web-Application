import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Address = sequelize.define('Address', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        shipping_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [2, 100]
            }
        },
        shipping_phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                is: /^[\d\+\-\(\) ]+$/ // Basic phone format validation
            }
        },
        address_line1: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        address_line2: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        postal_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        shipping_cost_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'shipping_costs',
                key: 'id',
            },
        },
    }, {
        tableName: 'addresses',
        timestamps: true,
    });

    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            foreignKey: 'user_id'
        });

        Address.belongsTo(models.ShippingCost, {
            foreignKey: 'shipping_cost_id',
        });

    }

    return Address;
}
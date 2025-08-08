import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./users.js";

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    order_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'canceled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    paranoid: true,
});

export default Order;
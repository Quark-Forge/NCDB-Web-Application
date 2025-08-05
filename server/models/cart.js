// models/cart.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./users.js";

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
    },
}, {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
    paranoid: true,
});



export default Cart;
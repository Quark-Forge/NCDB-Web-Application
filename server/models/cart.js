import { DataTypes } from "sequelize";

export default (sequelize) => {
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
                model: 'users',
                key: 'id'
            },
        },
    }, {
        tableName: 'carts',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Cart.associate = (models) => {
        Cart.hasMany(models.CartItem, {
            foreignKey: 'cart_id',
            onDelete: 'CASCADE'
        });
    };
    return Cart;
}
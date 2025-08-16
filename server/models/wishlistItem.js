import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WishlistItem = sequelize.define('wishlist_items', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        wishlist_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'wishlists',
                key: 'id'
            },
            onDelete: 'CASCADE'
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
        tableName: 'wishlist_items',
        timestamps: true,
    });

    WishlistItem.associate = (models) => {
        WishlistItem.belongsTo(models.Wishlist, {
            foreignKey: 'wishlist_id',
        });

        WishlistItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
        });
    };

    return WishlistItem;
}
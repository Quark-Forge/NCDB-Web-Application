import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Wishlist = sequelize.define('wishlists', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: 'My Wishlist',
            validate: {
                notEmpty: true
            }
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE',
        },
    }, {
        tableName: 'wishlists',
        timestamps: true,
    });

    Wishlist.associate = (models) => {
        Wishlist.hasMany(models.WishlistItem, {
            foreignKey: 'wishlist_id',
            onDelete: 'CASCADE'
        });
    };

    return Wishlist;
}
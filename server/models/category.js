import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.TEXT,
            validate: {
                len: [0, 2000]
            }
        }
    }, {
        tableName: 'categories',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Category.associate = (models) => {
        Category.hasMany(models.Product, {
            foreignKey: 'category_id',
        });
    };

    return Category;
}
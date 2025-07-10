import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

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
    },
    description: {
        type: DataTypes.TEXT,
        unique: false,
    }
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    paranoid: true,
});

export default Category;
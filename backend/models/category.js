import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: false,
    },
    description: {
        type: DataTypes.TEXT,
        unique: false,
    }
}, {
    tableName: 'categories',
    timestamps: false,
    underscored: true,
});

export default Category;
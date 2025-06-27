import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique:false,
    },
    contact_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
    },
  
}, {
    tableName: 'suppliers',
    timestamps: false,
    underscored:true,
});

export default Supplier;
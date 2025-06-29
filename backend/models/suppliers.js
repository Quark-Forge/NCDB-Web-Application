import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,

    },
    contact_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        set(value) {
            if (value) {
                this.setDataValue('email', value.toLowerCase().trim());
            }
        }
    },
}, {
    tableName: 'suppliers',
    timestamps: true,
    underscored: true,
});

export default Supplier;
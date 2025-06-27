import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'roles',
  timestamps: false,
});

export default Role;
import sequelize from "../config/db.js";
import { DataTypes, Sequelize } from "sequelize";
import Role from "./roles.js";

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 50],
    }
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  contact_number: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: false,
  },
  password: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },

}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

User.belongsTo(Role, { foreignKey: 'role_id' });

export default User;
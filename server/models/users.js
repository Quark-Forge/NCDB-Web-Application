import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import Role from "./roles.js";

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: false,
    validate: {
      notEmpty: true,
      len: [5, 50],
    }
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
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
  password: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: {
        args: [8, 200],
        msg: 'Password must be at least 8 characters'
      }
    },
  },
  image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
    },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Role,
      key: 'id'
    }
  },

}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

User.belongsTo(Role, {
  foreignKey: 'role_id',
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
});

export default User;
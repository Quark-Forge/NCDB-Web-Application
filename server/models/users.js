import { DataTypes } from "sequelize";

export default (sequelize) => {
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
        model: 'roles',
        key: 'id'
      }
    },

  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  User.associate = (models) => {
    // Role relationship
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // Address relationship
    User.hasMany(models.Address, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });

    // Cart relationship
    User.hasOne(models.Cart, {
      foreignKey: 'user_id',
    });

    // Order relationship
    User.hasMany(models.Order, {
      foreignKey: 'user_id',
    });

    // Wishlist relationship
    User.hasMany(models.Wishlist, {
      foreignKey: 'user_id',
    });

    // supplier_item_requests relationship
    User.hasMany(models.SupplierItemRequest, {
      foreignKey: 'created_by',
      onDelete: 'RESTRICT'
    });
  };
  return User;
}


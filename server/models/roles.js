import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Role = sequelize.define('Role', {
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
  }, {
    tableName: 'roles',
    timestamps: false,
    paranoid: true,
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  };

  return Role;
}
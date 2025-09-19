import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Supplier = sequelize.define('Supplier', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Supplier name cannot be empty"
                },
                len: {
                    args: [2, 100],
                    msg: "Supplier name must be between 2 and 100 characters"
                }
            }
        },
        contact_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: {
                msg: "This contact number is already in use"
            },
            validate: {
                is: {
                    args: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
                    msg: "Invalid phone number format"
                }
            }
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Address cannot be empty"
                }
            }
        },
        email: {
            type: DataTypes.STRING(200),
            allowNull: true,
            unique: {
                msg: "This email is already in use"
            },
            validate: {
                isEmail: {
                    msg: "Invalid email format"
                }
            },
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
        paranoid: true,
    });

    Supplier.associate = (models) => {
        // Product many-to-many relationship
        Supplier.belongsToMany(models.Product, {
            through: models.SupplierItem,
            foreignKey: 'supplier_id',
        });

        // Explicit SupplierItem relationship
        Supplier.hasMany(models.SupplierItem, {
            foreignKey: 'supplier_id',
        });

        // Cart items relationship
        Supplier.hasMany(models.CartItem, {
            foreignKey: 'supplier_id',
        });

        // Order items relationship
        Supplier.hasMany(models.OrderItem, {
            foreignKey: 'supplier_id',
        });

        // supplier_item_requests relationship
        Supplier.hasMany(models.SupplierItemRequest, {
            foreignKey: 'supplier_id',
            onDelete: 'CASCADE'
        })
    };

    return Supplier;
}
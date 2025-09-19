import { DataTypes } from "sequelize";
export default (sequelize) => {
    const SupplierItemRequest = sequelize.define('SupplierItemRequest', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        supplier_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'supplier_items',
                key: 'id'
            }
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'suppliers',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        urgency: {
            type: DataTypes.ENUM('high', 'medium', 'low'),
            allowNull: false,
            defaultValue: 'medium'
        },
        notes_from_requester: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notes_from_supplier: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        supplier_quote: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                isDecimal: true,
                min: 0,
            },
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        rejection_reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },

    }, {
        tableName: 'supplier_item_requests',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    SupplierItemRequest.associate = (models) => {
        SupplierItemRequest.belongsTo(models.SupplierItem, {
            foreignKey: 'supplier_item_id',
            onDelete: 'RESTRICT'
        });
        SupplierItemRequest.belongsTo(models.Supplier, {
            foreignKey: 'supplier_id',
            onDelete: 'CASCADE'
        });
        SupplierItemRequest.belongsTo(models.User, {
            foreignKey: 'created_by',
            onDelete: 'SET NULL'
        });
    };

    return SupplierItemRequest;
};





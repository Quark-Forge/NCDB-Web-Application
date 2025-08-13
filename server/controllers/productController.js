import asyncHandler from 'express-async-handler';
import { Category, OrderItem, Product, Supplier, SupplierItem } from '../models/index.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

// Helper function
const toTitleCase = (str) => str.replace(/\b\w/g, char => char.toUpperCase());

// Add new product
export const addProduct = asyncHandler(async (req, res) => {
    const requiredFields = [
        'name', 'sku', 'description', 'category_id',
        'supplier_id', 'supplier_sku', 'purchase_price',
        'price', 'quantity_per_unit', 'unit_symbol'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    const transaction = await sequelize.transaction();
    try {
        const { sku, name, supplier_id } = req.body;

        // Check for existing product
        const existingProduct = await Product.findOne({ where: { sku }, transaction });

        if (existingProduct) {
            // Validate if supplier already provides this product
            const existingSupplierItem = await SupplierItem.findOne({
                where: { product_id: existingProduct.id, supplier_id },
                transaction
            });

            if (existingSupplierItem) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'This supplier already provides this product'
                });
            }

            // Create new supplier relationship
            const newSupplierItem = await SupplierItem.create({
                ...req.body,
                product_id: existingProduct.id
            }, { transaction });

            await transaction.commit();
            return res.status(200).json({
                success: true,
                message: 'New supplier added for existing product',
                data: {
                    product: existingProduct,
                    supplier_item: newSupplierItem
                }
            });
        }

        // Create new product and supplier item
        const newProduct = await Product.create({
            name: req.body.name.trim().toLowerCase(),
            sku: req.body.sku,
            description: req.body.description,
            base_image_url: req.body.base_image_url,
            category_id: req.body.category_id,
            created_by: req.user.id
        }, { transaction });

        const newSupplierItem = await SupplierItem.create({
            ...req.body,
            product_id: newProduct.id
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product: {
                    ...newProduct.toJSON(),
                    name: toTitleCase(newProduct.name)
                },
                supplier_item: newSupplierItem
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: `Failed to add product: ${error.message}`
        });
    }
});

// Get all products with filters
export const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const { search, category, supplier, minStock, page = 1, limit = 10 } = req.query;

        const where = {};
        const supplierItemWhere = {};

        if (search) where.name = { [Op.like]: `%${search}%` };
        if (supplier) supplierItemWhere.supplier_id = supplier;
        if (minStock) supplierItemWhere.stock_level = { [Op.gte]: minStock };

        const include = [
            {
                model: Category,
                where: category ? { name: category } : undefined,
                attributes: ['id', 'name'],
                required: !!category
            },
            {
                model: SupplierItem,
                as: 'SupplierItems',
                where: supplierItemWhere,
                required: !!supplier || !!minStock,
                include: [{
                    model: Supplier,
                    as: 'Supplier',
                    attributes: ['id', 'name']
                }]
            }
        ];

        const { count, rows } = await Product.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            distinct: true
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to fetch products: ${error.message}`
        });
    }
});

// Get single product by ID
export const getProductById = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                },
                {
                    model: SupplierItem,
                    as: 'SupplierItems',
                    include: [{
                        model: Supplier,
                        as: 'Supplier',
                        attributes: ['id', 'name', 'contact_number', 'email']
                    }]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const totalStock = product.SupplierItems.reduce(
            (sum, item) => sum + item.stock_level, 0
        );

        res.status(200).json({
            success: true,
            data: {
                ...product.toJSON(),
                name: toTitleCase(product.name),
                total_stock: totalStock,
                suppliers: product.SupplierItems.map(item => ({
                    ...item.toJSON(),
                    supplier_name: item.Supplier?.name,
                    contact: item.Supplier?.contact_number,
                    email: item.Supplier?.email
                }))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to fetch product: ${error.message}`
        });
    }
});

// Update product details
export const updateProduct = asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id, { transaction });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Remove restricted fields
        const { sku, supplier_sku, ...updates } = req.body;

        if (sku !== undefined || supplier_sku !== undefined) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'SKU and supplier SKU cannot be modified through this endpoint'
            });
        }

        const updatableFields = [
            'name', 'description', 'price',
            'discount_price', 'quantity_per_unit',
            'unit_symbol', 'image_url', 'category_id'
        ];

        const changes = {};
        for (const field of updatableFields) {
            if (updates[field] !== undefined && updates[field] !== product[field]) {
                changes[field] = field === 'name'
                    ? updates[field].trim().toLowerCase()
                    : updates[field];
            }
        }

        if (Object.keys(changes).length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'No valid changes provided'
            });
        }

        if (changes.category_id) {
            const categoryExists = await Category.findByPk(changes.category_id, { transaction });
            if (!categoryExists) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Category not found'
                });
            }
        }

        await product.update(changes, { transaction });
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: {
                ...product.toJSON(),
                name: toTitleCase(product.name)
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: `Failed to update product: ${error.message}`
        });
    }
});

// Admin-only endpoint for SKU updates
export const updateProductSku = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: Only admins can update SKUs'
        });
    }

    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id, { transaction });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { new_sku, new_supplier_sku } = req.body;

        if (!new_sku && !new_supplier_sku) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Must provide either new_sku or new_supplier_sku'
            });
        }

        const changes = {};

        // Handle main SKU change
        if (new_sku && new_sku !== product.sku) {
            const skuExists = await Product.findOne({
                where: { sku: new_sku },
                transaction
            });

            if (skuExists) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'New SKU already exists'
                });
            }

            changes.sku = new_sku;
        }

        // Handle supplier SKU changes
        if (new_supplier_sku) {
            const supplierItems = await SupplierItem.findAll({
                where: { product_id: product.id },
                transaction
            });

            for (const item of supplierItems) {
                if (item.supplier_sku !== new_supplier_sku) {
                    await item.update({ supplier_sku: new_supplier_sku }, { transaction });
                }
            }
        }

        if (Object.keys(changes).length > 0) {
            await product.update(changes, { transaction });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'SKU updated successfully',
            data: {
                product_id: product.id,
                new_sku: new_sku || product.sku,
                new_supplier_sku: new_supplier_sku || 'unchanged'
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: `Failed to update SKU: ${error.message}`
        });
    }
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id, { transaction });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const hasOrders = await OrderItem.findOne({
            where: { product_id: req.params.id },
            transaction
        });

        if (hasOrders) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product with existing orders'
            });
        }

        await SupplierItem.destroy({
            where: { product_id: req.params.id },
            transaction
        });

        await product.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: {
                id: req.params.id,
                name: toTitleCase(product.name)
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: `Failed to delete product: ${error.message}`
        });
    }
});

// Update product stock
export const updateProductStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { supplier_id, quantity, action } = req.body;

    if (!['add', 'subtract', 'set'].includes(action)) {
        return res.status(400).json({
            success: false,
            message: 'Action must be one of: add, subtract, set'
        });
    }

    if (isNaN(quantity)) {
        return res.status(400).json({
            success: false,
            message: 'Quantity must be a number'
        });
    }

    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const supplier = await Supplier.findByPk(supplier_id, { transaction });
        if (!supplier) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        let supplierItem = await SupplierItem.findOne({
            where: { product_id: id, supplier_id },
            transaction
        });

        if (!supplierItem) {
            if (action !== 'set') {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Supplier item not found - can only set initial stock'
                });
            }
            supplierItem = await SupplierItem.create({
                product_id: id,
                supplier_id,
                stock_level: quantity
            }, { transaction });
        } else {
            const oldStock = supplierItem.stock_level;
            let newStock = oldStock;

            switch (action) {
                case 'add':
                    newStock = oldStock + Number(quantity);
                    break;
                case 'subtract':
                    if (oldStock < quantity) {
                        await transaction.rollback();
                        return res.status(400).json({
                            success: false,
                            message: 'Insufficient stock available'
                        });
                    }
                    newStock = oldStock - Number(quantity);
                    break;
                case 'set':
                    newStock = Number(quantity);
                    break;
            }

            supplierItem.stock_level = newStock;
            await supplierItem.save({ transaction });
        }

        await transaction.commit();
        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: {
                product_id: id,
                product_name: toTitleCase(product.name),
                supplier_id,
                supplier_name: supplier.name,
                stock_level: supplierItem.stock_level,
                action_performed: action
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: `Failed to update stock: ${error.message}`
        });
    }
});
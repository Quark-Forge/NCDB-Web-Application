import asyncHandler from 'express-async-handler';
import { Category, OrderItem, Product, Supplier, SupplierItem } from '../models/index.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

// Helper function
const toTitleCase = (str) => {
    if (!str) return str;
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

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
        const { search, category, supplier, minStock, minPrice, maxPrice, page = 1, limit = 10, sort } = req.query;

        const where = {};
        const supplierItemWhere = {};

        if (search) where.name = { [Op.like]: `%${search.toLowerCase()}%` };
        if (supplier) supplierItemWhere.supplier_id = supplier;
        if (minStock) supplierItemWhere.stock_level = { [Op.gte]: minStock };

        // Add price range filtering
        if (minPrice || maxPrice) {
            supplierItemWhere.price = {};
            if (minPrice) supplierItemWhere.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) supplierItemWhere.price[Op.lte] = parseFloat(maxPrice);
        }

        const include = [
            {
                model: Category,
                where: category ? { name: category } : undefined,
                attributes: ['id', 'name'],
                required: !!category
            },
            {
                model: SupplierItem,
                where: supplierItemWhere,
                required: !!supplier || !!minStock || !!minPrice || !!maxPrice,
                include: [{
                    model: Supplier,
                    attributes: ['id', 'name']
                }]
            }
        ];

        // Handle sorting
        let order = [];
        switch (sort) {
            case 'created_at_desc':
                order = [['createdAt', 'DESC']];
                break;
            case 'created_at_asc':
                order = [['createdAt', 'ASC']];
                break;
            case 'price_asc':
                // Sort by the first supplier item's price
                order = [[{ model: SupplierItem, as: 'SupplierItems' }, 'price', 'ASC']];
                break;
            case 'price_desc':
                // Sort by the first supplier item's price
                order = [[{ model: SupplierItem, as: 'SupplierItems' }, 'price', 'DESC']];
                break;
            case 'name_asc':
                order = [['name', 'ASC']];
                break;
            case 'name_desc':
                order = [['name', 'DESC']];
                break;
            default:
                order = [['createdAt', 'DESC']];
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            include,
            order,
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            distinct: true,
            subQuery: false // Important for sorting with includes
        });

        // Format the response data
        const formattedProducts = rows.map(product => {
            const productJson = product.toJSON();

            // Ensure prices are numbers
            if (productJson.SupplierItems && productJson.SupplierItems.length > 0) {
                productJson.SupplierItems = productJson.SupplierItems.map(item => ({
                    ...item,
                    price: Number(item.price),
                    purchase_price: Number(item.purchase_price),
                    discount_price: item.discount_price ? Number(item.discount_price) : null
                }));
            }

            return {
                ...productJson,
                name: toTitleCase(productJson.name),
                description: toTitleCase(productJson.description)
            };
        });

        res.status(200).json({
            success: true,
            data: formattedProducts,
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

// Get all products including soft-deleted ones
export const getAllProductsWithDeleted = asyncHandler(async (req, res) => {
    try {
        const { search, category, supplier, minStock, page = 1, limit = 10, sort } = req.query;

        const where = {
            [Op.or]: [
                { deletedAt: null },
                { deletedAt: { [Op.ne]: null } }
            ]
        };

        const supplierItemWhere = {};

        if (search) where.name = { [Op.like]: `%${search.toLowerCase()}%` };
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
                where: supplierItemWhere,
                required: !!supplier || !!minStock,
                include: [{
                    model: Supplier,
                    attributes: ['id', 'name']
                }],
                paranoid: false // Include deleted supplier items too
            }
        ];

        // Handle sorting 
        let order = [];
        switch (sort) {
            case 'created_at_desc':
                order = [['createdAt', 'DESC']];
                break;
            default:
                order = [['createdAt', 'DESC']];
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            include,
            order,
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            distinct: true,
            paranoid: false, // This is key to include soft-deleted records
            subQuery: false
        });

        // Format response
        const formattedProducts = rows.map(product => ({
            ...product.toJSON(),
            name: toTitleCase(product.name),
            description: toTitleCase(product.description),
            is_active: product.deletedAt ? false : true,
        }));

        res.status(200).json({
            success: true,
            data: formattedProducts,
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

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { supplier_id, image_url, ...updates } = req.body;

    // Validate that supplier_id is provided
    if (!supplier_id) {
        return res.status(400).json({
            success: false,
            message: "Supplier ID is required",
            code: "SUPPLIER_ID_REQUIRED"
        });
    }

    let transaction;

    try {
        transaction = await sequelize.transaction();

        // 1. Verify product exists
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Product not found",
                code: "PRODUCT_NOT_FOUND"
            });
        }

        // 2. Verify supplier exists
        const supplier = await Supplier.findByPk(supplier_id, { transaction });
        if (!supplier) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
                code: "SUPPLIER_NOT_FOUND"
            });
        }

        // 3. Find the specific supplier item
        const supplierItem = await SupplierItem.findOne({
            where: { product_id: id, supplier_id },
            transaction
        });

        if (!supplierItem) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Supplier item not found for this product",
                code: "PRODUCT_SUPPLIER_NOT_FOUND"
            });
        }

        // Prepare updates
        const productUpdates = {};
        const supplierItemUpdates = {};

        // Product fields
        if (updates.name !== undefined) {
            productUpdates.name = String(updates.name).trim().toLowerCase();
        }
        if (updates.category_id !== undefined) {
            productUpdates.category_id = updates.category_id;
        }

        // Handle image URL updates
        if (image_url !== undefined) {
            // If image_url is empty string or null, clear the image
            if (!image_url) {
                productUpdates.base_image_url = null;
                supplierItemUpdates.image_url = null;

                // Delete from Cloudinary if there was an existing image
                if (product.base_image_url && product.base_image_url.includes('cloudinary.com')) {
                    const publicId = extractPublicId(product.base_image_url);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                }
            } else {
                productUpdates.base_image_url = image_url;
                supplierItemUpdates.image_url = image_url;
            }
        }

        // SupplierItem fields
        const numericFields = {
            price: updates.price,
            discount_price: updates.discount_price,
            quantity_per_unit: updates.quantity_per_unit,
        };

        for (const [field, value] of Object.entries(numericFields)) {
            if (value !== undefined) {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `${field.replace('_', ' ')} must be a valid number`,
                        code: `INVALID_${field.toUpperCase()}`
                    });
                }
                supplierItemUpdates[field] = numValue;
            }
        }

        if (updates.unit_symbol !== undefined) {
            supplierItemUpdates.unit_symbol = updates.unit_symbol;
        }
        if (updates.description !== undefined) {
            supplierItemUpdates.description = updates.description === '' ? null : updates.description;
        }

        // Check if we have any updates to perform
        if (Object.keys(productUpdates).length === 0 &&
            Object.keys(supplierItemUpdates).length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "No valid changes provided",
                code: "NO_CHANGES"
            });
        }

        // Perform updates
        if (Object.keys(productUpdates).length > 0) {
            await product.update(productUpdates, { transaction });
        }

        if (Object.keys(supplierItemUpdates).length > 0) {
            await supplierItem.update(supplierItemUpdates, { transaction });
        }

        await transaction.commit();

        // Return updated data
        const updatedProduct = await Product.findByPk(id, {
            include: [
                {
                    model: SupplierItem,
                    where: { supplier_id },
                    include: [Supplier]
                },
                {
                    model: Category
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {
        console.error('Update error:', error);

        if (transaction && !transaction.finished) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }

        const response = {
            success: false,
            message: "Error updating product",
            code: "UPDATE_FAILED"
        };

        if (process.env.NODE_ENV === 'development') {
            response.error = error.message;
            if (error.name === 'SequelizeValidationError') {
                response.details = error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                    value: e.value
                }));
            }
        }

        return res.status(500).json(response);
    }
});

const extractPublicId = (url) => {
    if (!url) return null;
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|gif|webp)/);
    return matches ? matches[1] : null;
};

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

// Delete specific supplier's product item
export const deleteProduct = asyncHandler(async (req, res) => {
    const { product_id, supplier_id } = req.params;
    const transaction = await sequelize.transaction();

    try {
        // Verify product exists
        const product = await Product.findByPk(product_id, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        // Verify supplier exists
        const supplier = await Supplier.findByPk(supplier_id, { transaction });
        if (!supplier) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Supplier not found',
                code: 'SUPPLIER_NOT_FOUND'
            });
        }

        // Check if product has orders from this supplier
        const hasOrders = await OrderItem.findOne({
            where: {
                product_id,
                supplier_id
            },
            transaction
        });

        if (hasOrders) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product with existing orders from this supplier',
                code: 'HAS_ACTIVE_ORDERS'
            });
        }

        // Delete the specific supplier's product item
        const deletedCount = await SupplierItem.destroy({
            where: {
                product_id,
                supplier_id
            },
            transaction
        });

        if (deletedCount === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Supplier item not found for this product',
                code: 'SUPPLIER_ITEM_NOT_FOUND'
            });
        }

        // Check if this was the last supplier for the product
        const remainingSuppliers = await SupplierItem.count({
            where: { product_id },
            transaction
        });

        // If no more suppliers, delete the product itself
        if (remainingSuppliers === 0) {
            await product.destroy({ transaction });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: remainingSuppliers > 0
                ? 'Supplier product item deleted successfully'
                : 'Product deleted successfully (no remaining suppliers)',
            data: {
                product_id,
                product_name: toTitleCase(product.name),
                supplier_id,
                supplier_name: supplier.name,
                remaining_suppliers: remainingSuppliers
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: 'DELETE_FAILED'
        });
    }
});

// Restore a soft-deleted product
export const restoreProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, { paranoid: false });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.deletedAt) {
            return res.status(400).json({
                success: false,
                message: 'Product is already active'
            });
        }

        // Restore the product
        await product.restore();

        res.status(200).json({
            success: true,
            message: 'Product restored successfully',
            data: {
                product: {
                    ...product.toJSON(),
                    name: toTitleCase(product.name)
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to restore product: ${error.message}`
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
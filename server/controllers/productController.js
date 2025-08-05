import asyncHandler from 'express-async-handler';
import { Category, Product, Supplier, SupplierItem } from '../models/index.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

// Add new product
export const addProduct = asyncHandler(async (req, res) => {
    const {
        name,
        sku,
        description,
        price,
        discount_price,
        quantity_per_unit,
        quantity,
        unit_symbol,
        image_url,
        category_id,
        supplier_id
    } = req.body;

    // Input validation
    if (!name || !price || !unit_symbol || !category_id || !quantity || !supplier_id || !quantity_per_unit || !sku) {
        res.status(400);
        throw new Error('name, sku, price, quantity_per_unit, quantity, unit_symbol, supplier_id, and category_id are required');
    }

    // Sanitize inputs
    const normalized_name = name.trim().toLowerCase();
    const sanitized_sku = sku.trim();
    const sanitized_description = description ? description.trim() : null;
    const sanitized_unit_symbol = unit_symbol.trim();
    const sanitized_image_url = image_url ? image_url.trim() : null;

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
        res.status(400);
        throw new Error('Category not found or has been deleted');
    }

    // Verify supplier exists
    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
        res.status(400);
        throw new Error('Supplier not found or has been deleted');
    }

    const transaction = await sequelize.transaction();

    try {
        // Check if product exists (same name + category)
        const existingProduct = await Product.findOne({
            where: { name: normalized_name, category_id: category_id },
            transaction,
        });

        if (existingProduct) {
            // Check if SupplierItem exists (same product + supplier)
            const supplierItem = await SupplierItem.findOne({
                where: { product_id: existingProduct.id, supplier_id },
                transaction,
            });

            if (supplierItem) {
                // If both exist then Update stock
                supplierItem.stock_level += Number(quantity);
                await supplierItem.save({ transaction });

                await transaction.commit();

                return res.status(200).json({
                    success: true,
                    message: 'Product already exists. Stock updated successfully.',
                    product: {
                        ...existingProduct.toJSON(),
                        name: toTitleCase(existingProduct.name)
                    },
                    stock_level: supplierItem.stock_level,
                });
            } else {
                // Create new supplier relationship
                const newSupplierItem = await SupplierItem.create({
                    stock_level: quantity,
                    supplier_id,
                    product_id: existingProduct.id,
                }, { transaction });

                await transaction.commit();
                return res.status(200).json({
                    success: true,
                    message: 'New supplier added for existing product',
                    product: existingProduct,
                    stock_level: newSupplierItem.stock_level,
                });
            }
        }

        // Check for duplicate SKU
        const existingSKU = await Product.findOne({
            where: { sku: sanitized_sku },
            transaction,
        });

        if (existingSKU) {
            await transaction.rollback();
            res.status(400);
            throw new Error('A product with this SKU already exists');
        }

        // create new product
        const newProduct = await Product.create({
            name: normalized_name,
            sku: sanitized_sku,
            description: sanitized_description,
            price: Number(price),
            discount_price: discount_price ? Number(discount_price) : null,
            unit_symbol: sanitized_unit_symbol,
            quantity_per_unit: Number(quantity_per_unit),
            image_url: sanitized_image_url,
            category_id: category_id,
        }, { transaction });

        // Create new SupplierItem
        const newSupplierItem = await SupplierItem.create({
            stock_level: Number(quantity),
            supplier_id,
            product_id: newProduct.id,
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'New product added successfully',
            product: {
                ...newProduct.toJSON(),
                name: toTitleCase(newProduct.name)
            },
            stock_level: newSupplierItem.stock_level,
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500);
        throw new Error('Failed to add product: ' + error.message);
    }
});

// Helper function to chnage text to titlecase
function toTitleCase(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}


// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
    const { search, category, sort, page = 1, limit = 10, supplier } = req.query;
    const where = {};
    const supplierItemWhere = {};

    // Search by product name
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }

    // Filter by supplier if provided
    if (supplier) {
        supplierItemWhere.supplier_id = supplier;
    }

    // Sorting
    let order = [['created_at', 'DESC']]; // default
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'name_asc') order = [['name', 'ASC']];
    else if (sort === 'name_desc') order = [['name', 'DESC']];

    const offset = (page - 1) * limit;

    // Include category and supplier items
    const include = [
        {
            model: Category,
            where: category ? { name: category } : undefined,
            attributes: ['id', 'name'],
            required: !!category
        },
        {
            model: SupplierItem,
            attributes: ['id', 'stock_level', 'supplier_id'],
            where: supplierItemWhere,
            required: !!supplier,
            include: [{
                model: Supplier,
                attributes: ['id', 'name'],
                required: false
            }]
        }
    ];

    try {
        const products = await Product.findAll({
            paranoid: false,
            where,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include,
        });

        // Transform products to have one entry per supplier
        const expandedProducts = products.flatMap(product => {
            const productJson = product.toJSON();

            // If no supplier items, return just the product
            if (!productJson.SupplierItems || productJson.SupplierItems.length === 0) {
                return [{
                    ...productJson,
                    name: toTitleCase(productJson.name),
                    supplier_id: null,
                    supplier_name: null,
                    stock_level: 0,
                    suppliers: []
                }];
            }

            return productJson.SupplierItems.map(supplierItem => ({
                ...productJson,
                name: toTitleCase(productJson.name),
                supplier_id: supplierItem.supplier_id,
                supplier_name: supplierItem.Supplier?.name,
                stock_level: supplierItem.stock_level,
                suppliers: productJson.SupplierItems.map(item => ({
                    supplier_id: item.supplier_id,
                    supplier_name: item.Supplier?.name,
                    stock_level: item.stock_level
                }))
            }));
        });

        // Get the count of transformed products (what will actually be displayed)
        const displayCount = expandedProducts.length;

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: expandedProducts,
            totalCount: displayCount,
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving products',
            error: error.message
        });
    }
});

// Get Product by ID
export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(400);
        throw new Error('Invalid product ID');
    }

    try {
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                },
                {
                    model: SupplierItem,
                    attributes: ['id', 'stock_level', 'supplier_id'],
                    include: [{
                        model: Supplier,
                        attributes: ['id', 'name', 'email', 'contact_number']
                    }]
                }
            ]
        });

        if (!product) {
            res.status(404);
            throw new Error(`Product with ID ${id} not found`);
        }

        const productData = product.get({ plain: true });
        const suppliers = productData.SupplierItems?.map(({ Supplier, stock_level }) => ({
            id: Supplier?.id,
            name: Supplier?.name,
            email: Supplier?.email,
            phone: Supplier?.contact_number,
            stock: stock_level
        })) || [];

        res.status(200).json({
            success: true,
            data: {
                id: productData.id,
                name: toTitleCase(productData.name),
                description: productData.description,
                price: productData.price,
                imageUrl: productData.image_url,
                category: productData.Category,
                totalStock: suppliers.reduce((sum, { stock }) => sum + stock, 0),
                suppliers
            }
        });

    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


// Update Product details
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        name,
        sku,
        description,
        price,
        discount_price,
        quantity_per_unit,
        unit_symbol,
        image_url,
        category_id
    } = req.body;

    if (!id) {
        res.status(400);
        throw new Error('No ID provided in the params');
    }

    if (!name && !sku && !description && !price && !discount_price &&
        !quantity_per_unit && !unit_symbol && !image_url && !category_id) {
        res.status(400);
        throw new Error('At least one field to update is required');
    }

    if (price && isNaN(price)) {
        res.status(400);
        throw new Error('Price must be a number');
    }

    if (discount_price && isNaN(discount_price)) {
        res.status(400);
        throw new Error('Discount price must be a number');
    }

    const transaction = await sequelize.transaction();

    try {
        const product = await Product.findByPk(id, { transaction });

        if (!product) {
            await transaction.rollback();
            res.status(404);
            throw new Error(`Product with ID ${id} not found`);
        }

        // Verify category exists if being updated
        if (category_id) {
            const category = await Category.findByPk(category_id, { transaction });
            if (!category) {
                await transaction.rollback();
                res.status(400);
                throw new Error('Category not found');
            }
        }

        // Update product fields
        if (name) product.name = name.trim().toLowerCase();
        if (sku) product.sku = sku;
        if (description) product.description = description;
        if (price) product.price = price;
        if (discount_price) product.discount_price = discount_price;
        if (quantity_per_unit) product.quantity_per_unit = quantity_per_unit;
        if (unit_symbol) product.unit_symbol = unit_symbol;
        if (image_url) product.image_url = image_url;
        if (category_id) product.category_id = category_id;

        await product.save({ transaction });
        await transaction.commit();

        const updatedProduct = {
            ...product.toJSON(),
            name: toTitleCase(product.name),
        };

        res.status(200).json({
            success: true,
            message: `Product with ID ${id} updated successfully`,
            data: updatedProduct,
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500);
        throw new Error('Failed to update product: ' + error.message);
    }
});


// Delete Product
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(400);
        throw new Error('No ID provided in the params');
    }

    const transaction = await sequelize.transaction();

    try {
        //Check if the product exists
        const product = await Product.findByPk(id, { transaction });

        if (!product) {
            await transaction.rollback();
            res.status(404);
            throw new Error(`Product with ID ${id} not found`);
        }

        // Check for supplier items
        const supplierItems = await SupplierItem.findAll({
            where: { product_id: id },
            transaction
        });

        if (supplierItems.length > 0) {
            await SupplierItem.destroy({
                where: { product_id: id },
                transaction
            });
        }

        // Delete the product
        await product.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: `Product with ID ${id} deleted successfully`,
            deletedProduct: {
                ...product.toJSON(),
                name: toTitleCase(product.name)
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500);
        throw new Error('Failed to delete product: ' + error.message);
    }
});
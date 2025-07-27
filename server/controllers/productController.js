import asyncHandler from 'express-async-handler';
import Category from '../models/category.js';
import Product from '../models/product.js';
import SupplierItem from '../models/suplierItem.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';
import Supplier from '../models/suppliers.js';

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

    const normalized_name = name.trim().toLowerCase();

    const category = await Category.findByPk(category_id);
    if (!category) {
        res.status(400);
        throw new Error('Category not found');
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
                    message: 'Stock updated',
                    product: existingProduct,
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

        // create new product
        const newProduct = await Product.create({
            name: normalized_name,
            sku,
            description,
            price,
            discount_price,
            unit_symbol,
            quantity_per_unit,
            image_url,
            category_id: category_id,
        }, { transaction });

        // Create new SupplierItem
        const newSupplierItem = await SupplierItem.create({
            stock_level: quantity,
            supplier_id,
            product_id: newProduct.id,
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'New product added',
            product: newProduct,
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
    const supplierWhere = {};

    // Search by product name
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }

    // Filter by supplier if provided
    if (supplier) {
        supplierWhere.supplier_id = supplier;
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
            where: supplierWhere,
            required: false,
            include: [{
                model: Supplier,
                attributes: ['id', 'name'],
                required: false
            }]
        }
    ];

    const { count, rows: products } = await Product.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include,
        distinct: true // Important for correct count with joins
    });

    const updatedProducts = products.map(product => {
        const productJson = product.toJSON();
        return {
            ...productJson,
            name: toTitleCase(productJson.name),
            total_stock: productJson.SupplierItems?.reduce((sum, item) => sum + item.stock_level, 0) || 0,
            current_stock: supplier
                ? productJson.SupplierItems?.[0]?.stock_level || 0
                : undefined,
            suppliers: productJson.SupplierItems?.map(item => ({
                supplier_id: item.supplier_id,
                supplier_name: item.Supplier?.name,
                stock_level: item.stock_level
            }))
        };
    });

    res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: updatedProducts,
        totalCount: count,
    });
});

// Get Product by ID
export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Input validation
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

        // Transform the product data
        const productData = product.toJSON();
        const responseData = {
            ...productData,
            name: toTitleCase(productData.name),
            total_stock: productData.SupplierItems?.reduce((sum, item) => sum + item.stock_level, 0) || 0,
            suppliers: productData.SupplierItems?.map(item => ({
                supplier_id: item.supplier_id,
                supplier_name: item.Supplier?.name,
                contact: {
                    email: item.Supplier?.email,
                    phone: item.Supplier?.phone
                },
                stock_level: item.stock_level
            })) || []
        };

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Failed to fetch product: ${error.message}`);
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
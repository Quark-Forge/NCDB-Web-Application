import asyncHandler from 'express-async-handler';
import Category from '../models/category.js';
import Product from '../models/product.js';
import SupplierItem from '../models/suplierItem.js';
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
            where: { name: normalized_name, category_id: category_id},
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
    const { search, category, sort, page = 1,  limit = 10,  } = req.query;
    const where = {};

    // Search by product name
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }

    // Sorting
    let order = [['created_at', 'DESC']]; // default
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'name_asc') order = [['name', 'ASC']];
    else if (sort === 'name_desc') order = [['name', 'DESC']]; 

    const offset = (page - 1) * limit;

    // Include category and filter by category name if provided
    const include = [{
        model: Category,
        where: category ? { name: category } : undefined,
        attributes: ['id', 'name'],
        required: !!category
    }];

    const { count, rows: products } = await Product.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include,
    });

    const updatedProducts = products.map(product => ({
        ...product.toJSON(),
        name: toTitleCase(product.name),
    }));


    res.status(200).json({
        success: true,
        message: 'Filtered, searched, and sorted products',
        data: updatedProducts,
        totalCount: count,
    });
});

// Get Product by ID
export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400);
        throw new Error('No ID provided in the params');
    }

    const product = await Product.findByPk(id);

    if (!product) {
        res.status(404);
        throw new Error(`Product with ID ${id} not found`);
    }

    const updatedProduct = {
        ...product.toJSON(),
        name: toTitleCase(product.name),
    };

    res.status(200).json({
        success: true,
        message: `Product details for ID ${id}`,
        data: updatedProduct,
    });
});

// Update Porduct details
// export const updateProduct = asyncHandler(async (req, res) => {
//     const { 
//         name, 
//         sku, 
//         description, 
//         price, 
//         discount_price, 
//         quantity_per_unit, 
//         quantity, 
//         unit_symbol, 
//         image_url, 
//         category_id, 
//         supplier_id 
//     } = req.body;
    
// });


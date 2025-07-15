import asyncHandler from 'express-async-handler';
import Category from '../models/category.js';
import Product from '../models/product.js';
import SupplierItem from '../models/suplierItem.js';
import sequelize from '../config/db.js';

// Add new product
export const addProduct = asyncHandler(async (req, res) => {
    const { name, 
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

// get all products
export const getAllProducts = asyncHandler(async (req, res) => {
    const allPorducts = await Product.findAll();
    res.status(200).json({
        success: true,
        message: 'All Products',
        data: allPorducts,
    });
});
import asyncHandler from 'express-async-handler';
import Category from '../models/category.js';

// Create new Category
export const createCategory = asyncHandler(async (req, res) => {
    let { name, description } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }
    name = name.trim().toLowerCase();
    const existingCategory = await Category.findOne({
        where: { name },
        paranoid: false,
    });

    if (existingCategory) {
        if (existingCategory.deletedAt) {
            await existingCategory.restore();
            return res.status(200).json({
                message: 'Category restored',
                data: {
                    id: existingCategory.id,
                    name: toTitleCase(existingCategory.name),
                    description: existingCategory.description,
                },
            });
        }
        // Already exists and not deleted
        return res.status(400).json({
            message: 'Category already exists',
            data: existingCategory,
        });
    }
    // Create the new category
    const newCategory = await Category.create({
        name,
        description,
    });
    return res.status(201).json({
        message: 'New Category created',
        data: {
            id: newCategory.id,
            name: toTitleCase(newCategory.name),
            description: newCategory.description,
        },
    });
});

// Helper function to chnage text to lowercase
function toTitleCase(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Get All categories
export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.findAll({ paranoid: false });
    return res.status(200).json({
        message: 'all categories including disabled',
        data: categories,
    });
});


// Get only active categories
export const getActiveCategories = asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    return res.status(200).json({
        message: 'Active categories only',
        data: categories,
    });
});

// Get single Category
export const getSingleCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id, { paranoid: false });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    return res.status(200).json({
        message: 'category found successfully',
        data: {
            id: category.id,
            name: toTitleCase(category.name),
            description: category.description,
        }
    });
});

// Update a category
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let { name, description } = req.body;

    const category = await Category.findByPk(id, { paranoid: false });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    name = name ? name.trim().toLowerCase() : category.name;
    description = description ? description.trim() : category.description;

    if (name !== category.name) {
        const existing = await Category.findOne({
            where: { name },
            paranoid: false,
        });

        if (existing && existing.id !== category.id) {
            res.status(400);
            throw new Error('Another category with this name already exists');
        }
    }

    category.name = name;
    category.description = description;

    await category.save();

    res.status(200).json({
        message: 'Category updated',
        data: {
            id: category.id,
            name: toTitleCase(category.name),
            description: category.description,
        },
    });
});

// Soft Delete a Category
export const disabledCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    category.destroy();
    res.status(200).json({
        message: 'Category is disabled successfully',
        data: {
            id: category.id,
            name: toTitleCase(category.name),
            description: category.description,
        },
    });
});

// Permanantly Delete a Category
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id, { paranoid: false });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    await category.destroy({ force: true });

    return res.status(200).json({
        message: 'Category permanently deleted',
        data: {
            id: category.id,
            name: category.name,
        },
    });
});

// Restore the soft Deleted Category
export const restoreCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id, { paranoid: false });

    if (!category) {
        res.status(400);
        throw new Error('Category not found');
    }
    if (!category.deletedAt) {
        return res.status(400).json({ message: 'Category is already active' });
    }
    await category.restore();

    return res.status(200).json({
        message: 'Category restored successfully',
        data: {
            id: category.id,
            name: toTitleCase(category.name),
            description: category.description,
        },
    });
});

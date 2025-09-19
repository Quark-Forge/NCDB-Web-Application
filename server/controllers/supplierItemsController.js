import asyncHandler from 'express-async-handler';
import { Supplier, Product, SupplierItem } from '../models/index.js';
import { Op } from 'sequelize';

// Get all supplier-product 
export const getAllSupplierItems = asyncHandler(async (req, res) => {
  try {
    const supplierItems = await SupplierItem.findAll({
      include: [
        { model: Supplier, attributes: ['id', 'name'] },
        { model: Product, attributes: ['id', 'name'] }
      ],
      paranoid: false,
    });

    const data = { supplierItems: supplierItems, count: supplierItems.length };
    res.status(200).json({
      success: true,
      data: data,
      message: "Supplier items fetched successfully."
    });


  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supplier items." });
  }
});

// Get single supplier item by ID
export const getSupplierItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const supplierItem = await SupplierItem.findByPk(id, {
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name']
        }
      ],
      paranoid: false
    });

    if (!supplierItem) {
      return res.status(404).json({
        success: false,
        message: 'Supplier item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: supplierItem
    });

  } catch (error) {
    console.error('Error fetching supplier item:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch supplier item."
    });
  }
});

// Get low stock products (stock level below threshold)
export const getLowStockProducts = asyncHandler(async (req, res) => {
  try {
    const { threshold = 10, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: lowStockItems } = await SupplierItem.findAndCountAll({
      where: {
        stock_level: {
          [Op.lt]: parseInt(threshold) // Less than threshold
        }
      },
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name', 'contact_number', 'email'],
          paranoid: false
        },
        {
          model: Product,
          attributes: ['id', 'name', 'sku'],
          paranoid: false
        }
      ],
      order: [
        ['stock_level', 'ASC'], // Show lowest stock first
        ['updatedAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset,
      paranoid: false,
    });

    // Format the response with more useful data
    const formattedItems = lowStockItems.map(item => ({
      id: item.id,
      stock_level: item.stock_level,
      threshold: parseInt(threshold),
      supplier: {
        id: item.Supplier?.id,
        name: item.Supplier?.name,
        contact: item.Supplier?.contact_number,
        email: item.Supplier?.email
      },
      product: {
        id: item.Product?.id,
        name: item.Product?.name,
        sku: item.Product?.sku,
        price: item.Product?.price,
        image_url: item.Product?.base_image_url
      },
      needs_restock: item.stock_level <= 5, // Critical level
      last_updated: item.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
      meta: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        threshold: parseInt(threshold),
        critical_items: formattedItems.filter(item => item.needs_restock).length
      }
    });

  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch low stock products."
    });
  }
});

// Get critical stock products (stock level below 5)
export const getCriticalStockProducts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: criticalStockItems } = await SupplierItem.findAndCountAll({
      where: {
        stock_level: {
          [Op.lt]: 5 // Critical level: less than 5
        }
      },
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name', 'contact_number', 'email'],
          paranoid: false
        },
        {
          model: Product,
          attributes: ['id', 'name', 'sku'],
          paranoid: false
        }
      ],
      order: [
        ['stock_level', 'ASC'], // Show lowest stock first
        ['updatedAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset,
      paranoid: false,
    });

    const formattedItems = criticalStockItems.map(item => ({
      id: item.id,
      stock_level: item.stock_level,
      supplier: {
        id: item.Supplier?.id,
        name: item.Supplier?.name,
        contact: item.Supplier?.contact_number,
        email: item.Supplier?.email
      },
      product: {
        id: item.Product?.id,
        name: item.Product?.name,
        sku: item.Product?.sku,
        price: item.Product?.price,
        image_url: item.Product?.base_image_url
      },
      last_updated: item.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
      meta: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        critical_threshold: 5
      }
    });

  } catch (error) {
    console.error('Error fetching critical stock products:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch critical stock products."
    });
  }
});

// Get all products for a specific supplier
export const getSupplierItemsBySupplier = asyncHandler(async (req, res) => {
  const { supplier_id } = req.params;
  try {
    const supplierItems = await SupplierItem.findAll({
      where: { supplier_id },
      include: [{ model: Product }],
      paranoid: false,
    });
    res.status(200).json(supplierItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supplier items." });
  }
});

// Delete a specific product from a supplier
export const deleteSupplierItem = asyncHandler(async (req, res) => {
  const { supplier_id, product_id } = req.params;
  try {
    // Check if the supplier-product association exists
    const supplierItem = await SupplierItem.findOne({
      where: { supplier_id, product_id }
    });

    if (!supplierItem) {
      return res.status(404).json({ error: "Supplier item not found." });
    }

    await supplierItem.destroy();

    res.status(200).json({ success: true, message: "Product removed from supplier." });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove product from supplier." });
  }
});

// Add/Update a product for a supplier
export const updateSupplierItem = asyncHandler(async (req, res) => {
  const { supplier_id, product_id } = req.params;
  const { stock_level } = req.body;

  try {
    const [supplierItem, created] = await SupplierItem.upsert(
      { supplier_id, product_id, stock_level },
      { returning: true }
    );

    res.status(200).json({
      success: true,
      message: created ? "Supplier item added." : "Supplier item updated.",
      data: supplierItem
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update supplier item." });
  }
});
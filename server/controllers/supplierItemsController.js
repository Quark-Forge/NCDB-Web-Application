import SupplierItem from '../models/suplierItem.js';
import { Supplier, Product } from '../models/index.js';


// Get all supplier-product 
export const getAllSupplierItems = async (req, res) => {
  try {
    const supplierItems = await SupplierItem.findAll({
      include: [
        { model: Supplier, attributes: ['id', 'name'] },
        { model: Product, attributes: ['id', 'name', 'price'] }
      ],
      paranoid: false,
    });
    res.status(200).json(supplierItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supplier items." });
  }
};


// Get all products for a specific supplier
export const getSupplierItemsBySupplier = async (req, res) => {
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
};


// Delete a specific product from a supplier
export const deleteSupplierItem = async (req, res) => {
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
};


// Add/Update a product for a supplier
export const updateSupplierItem = async (req, res) => {
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
};
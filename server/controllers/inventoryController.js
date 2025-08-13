import InventoryStock from '../models/inventoryStock.js';
import InventoryTransaction from '../models/inventoryTransaction.js';
import Product from '../models/product.js';

// 1. View all stock levels
export const getAllStock = async (req, res) => {
  try {
    // Include product info with stock
    const stock = await InventoryStock.findAll({
      include: {
        model: Product,
        attributes: ['id', 'name', 'sku'], // select relevant product fields
      },
    });
    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Failed to fetch stock' });
  }
};

// 2. Receive stock - add new stock to product
export const receiveStock = async (req, res) => {
  const { product_id, quantity, note } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid product ID or quantity' });
  }

  try {
    // Find or create inventory stock row for product
    let stock = await InventoryStock.findOne({ where: { product_id } });

    if (!stock) {
      stock = await InventoryStock.create({ product_id, stock_on_hand: 0, reserved: 0 });
    }

    // Update stock_on_hand
    stock.stock_on_hand += quantity;
    await stock.save();

    // Log transaction
    await InventoryTransaction.create({
      product_id,
      quantity,
      type: 'RECEIVE',   // you can define type ENUM or string
      note: note || 'Stock received',
    });

    res.json({ message: 'Stock received successfully', stock });
  } catch (error) {
    console.error('Error receiving stock:', error);
    res.status(500).json({ message: 'Failed to receive stock' });
  }
};

// 3. Ship stock - reduce stock on hand
export const shipStock = async (req, res) => {
  const { product_id, quantity, note } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid product ID or quantity' });
  }

  try {
    const stock = await InventoryStock.findOne({ where: { product_id } });

    if (!stock || stock.stock_on_hand < quantity) {
      return res.status(400).json({ message: 'Insufficient stock to ship' });
    }

    stock.stock_on_hand -= quantity;
    await stock.save();

    await InventoryTransaction.create({
      product_id,
      quantity: -quantity,
      type: 'SHIP',
      note: note || 'Stock shipped',
    });

    res.json({ message: 'Stock shipped successfully', stock });
  } catch (error) {
    console.error('Error shipping stock:', error);
    res.status(500).json({ message: 'Failed to ship stock' });
  }
};

// 4. Manual adjustment (increase or decrease stock)
export const adjustStock = async (req, res) => {
  const { product_id, quantity, note } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    let stock = await InventoryStock.findOne({ where: { product_id } });

    if (!stock) {
      stock = await InventoryStock.create({ product_id, stock_on_hand: 0, reserved: 0 });
    }

    stock.stock_on_hand += quantity; // quantity can be positive or negative
    await stock.save();

    await InventoryTransaction.create({
      product_id,
      quantity,
      type: 'ADJUST',
      note: note || 'Manual stock adjustment',
    });

    res.json({ message: 'Stock adjusted successfully', stock });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ message: 'Failed to adjust stock' });
  }
};

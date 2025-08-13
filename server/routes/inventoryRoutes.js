import express from 'express';
import {
  getAllStock,
  receiveStock,
  shipStock,
  adjustStock
} from '../controllers/inventoryController.js';

const router = express.Router();

// GET /inventory - list all stock levels
router.get('/', getAllStock);

// POST /inventory/receive - add stock to inventory
router.post('/receive', receiveStock);

// POST /inventory/ship - reduce stock (ship out)
router.post('/ship', shipStock);

// POST /inventory/adjust - manual adjustment (add or subtract)
router.post('/adjust', adjustStock);

export default router;

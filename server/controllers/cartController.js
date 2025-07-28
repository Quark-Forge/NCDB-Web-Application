import { asyncHandler } from 'express-async-handler';
import Product from '../models/product';
import SupplierItem from '../models/suplierItem';

// export const addToCart =  asyncHandler (async (req, res) => {
//     const { product_id, quantity } = req.body;
//     const user_id = req.user.id;

//     // Validate input
//     if (!product_id || !quantity || quantity <= 0) {
//         res.status(400);
//         throw new Error('Invalid product data');
//     }

//     // Check if product exists and is available
//     const Supplier_item = await SupplierItem.findByPk(product_id);
//     if (!Supplier_item) {
//         res.status(404);
//         throw new Error('Product not found or unavailable');
//     }

//     // Check stock availability
    
//     if (product.stock < quantity) {
//         res.status(400);
//         throw new Error(`Only ${product.stock} items available in stock`);
//     }



// });

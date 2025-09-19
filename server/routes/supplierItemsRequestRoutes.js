import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { 
    cancelSupplierItemRequest, 
    createSupplierItemRequest, 
    deleteSupplierItemRequest, 
    getSupplierItemRequestById, 
    getSupplierItemRequests, 
    updateSupplierItemRequestStatus 
} from '../controllers/supplierItemsRequestController.js';

const router = express.Router();

// Routes for Admins and Inventory Managers
router.route('/')
    .post(protect, authorize('Admin', 'Inventory Manager'), createSupplierItemRequest)
    .get(protect, authorize('Admin', 'Inventory Manager'), getSupplierItemRequests);

// Routes for Suppliers to manage their requests
router.route('/supplier/my-requests')
    .get(protect, authorize('Supplier'), getSupplierItemRequests);

// Routes accessible by multiple roles with different permissions
router.route('/:id')
    .get(protect, authorize('Admin', 'Inventory Manager', 'Supplier'), getSupplierItemRequestById)
    .delete(protect, authorize('Admin'), deleteSupplierItemRequest);

// Supplier-specific routes for updating request status
router.route('/:id/status')
    .put(protect, authorize('Supplier'), updateSupplierItemRequestStatus);

// Route for cancelling requests (Admins and Inventory Managers)
router.route('/:id/cancel')
    .put(protect, authorize('Admin', 'Inventory Manager'), cancelSupplierItemRequest);

export default router;
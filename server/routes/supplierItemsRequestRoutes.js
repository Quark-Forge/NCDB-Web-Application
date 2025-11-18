import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import {
    cancelSupplierItemRequest,
    createSupplierItemRequest,
    deleteSupplierItemRequest,
    getSupplierItemRequestById,
    getSupplierItemRequests,
    getMySupplierItemRequests,
    updateSupplierItemRequestStatus,
    getRequestStatistics,
    updateSupplierItemRequest
} from '../controllers/supplierItemsRequestController.js';

const router = express.Router();

// All routes are protected

// Cancel route (admins and inventory managers)
router.route('/:id/cancel')
    .put(protect, authorize('Admin', 'Inventory Manager'), cancelSupplierItemRequest);

// Routes for Admins and Inventory Managers

router.route('/')
    .post(protect, authorize('Admin', 'Inventory Manager'), createSupplierItemRequest)
    .get(protect, authorize('Admin', 'Inventory Manager'), getSupplierItemRequests);

// Routes for Suppliers
router.route('/my-requests')
    .get(protect, authorize('Supplier'), getMySupplierItemRequests);

// Statistics route
router.route('/stats')
    .get(protect, authorize('Admin', 'Inventory Manager', 'Supplier'), getRequestStatistics);

// Single request routes with role-based access
router.route('/:id')
    .get(protect, authorize('Admin', 'Inventory Manager', 'Supplier'), getSupplierItemRequestById)
    .put(protect, authorize('Admin', 'Inventory Manager'), updateSupplierItemRequest)
    .delete(protect, authorize('Admin'), deleteSupplierItemRequest);

// Status update route (suppliers only)
router.route('/:id/status')
    .put(protect, authorize('Supplier'), updateSupplierItemRequestStatus);

export default router;
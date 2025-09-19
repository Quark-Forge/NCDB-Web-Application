import asyncHandler from 'express-async-handler';
import { SupplierItem, SupplierItemRequest, User, Supplier } from '../models/index.js';

// @desc    Create a new supplier item request
// @route   POST /api/supplier-item-requests
// @access  Private (Admin, Inventory Manager)
export const createSupplierItemRequest = asyncHandler(async (req, res) => {
    const { supplier_item_id, quantity, urgency, notes_from_requester } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!supplier_item_id || !quantity) {
        res.status(400);
        throw new Error('Supplier item ID and quantity are required');
    }

    const supplierItem = await SupplierItem.findByPk(supplier_item_id, {
        include: [{ model: Supplier }]
    });

    if (!supplierItem) {
        res.status(404);
        throw new Error('Supplier item not found');
    }

    if (quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    const newRequest = await SupplierItemRequest.create({
        supplier_item_id,
        quantity,
        urgency: urgency || 'medium',
        notes_from_requester,
        created_by: userId,
        supplier_id: supplierItem.supplier_id,
        status: 'pending'
    });

    // Populate the response with related data
    const populatedRequest = await SupplierItemRequest.findByPk(newRequest.id, {
        include: [
            {
                model: SupplierItem,
                include: [Supplier]
            },
            {
                model: User,
                attributes: ['id', 'name', 'email']
            }
        ]
    });

    // Send notification to supplier (you'll need to implement this)
    try {
        await sendNotificationToSupplier(populatedRequest);
    } catch (emailError) {
        console.error('Failed to send notification:', emailError);
        // Don't fail the request if email fails
    }

    res.status(201).json({
        success: true,
        data: populatedRequest,
        message: 'Supplier item request created successfully'
    });
});

// @desc    Get all supplier item requests
// @route   GET /api/supplier-item-requests
// @access  Private (Admin, Inventory Manager, Supplier - only their own)
export const getSupplierItemRequests = asyncHandler(async (req, res) => {
    const { status, supplier_id } = req.query;
    const userRole = req.user.role?.name;
    const userId = req.user.id;

    let whereClause = {};
    let includeClause = [
        {
            model: SupplierItem,
            include: [Supplier]
        },
        {
            model: User,
            attributes: ['id', 'name', 'email']
        }
    ];

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
        whereClause.status = status;
    }

    // Filter by supplier if provided (for admins/managers)
    if (supplier_id && (userRole === 'Admin' || userRole === 'Inventory Manager')) {
        whereClause.supplier_id = supplier_id;
    }

    // If user is a supplier, only show their own requests
    if (userRole === 'Supplier') {
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (supplier) {
            whereClause.supplier_id = supplier.id;
        } else {
            res.status(403);
            throw new Error('Supplier profile not found');
        }
    }

    const requests = await SupplierItemRequest.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']]
    });

    res.json({
        success: true,
        count: requests.length,
        data: requests
    });
});

// @desc    Get single supplier item request
// @route   GET /api/supplier-item-requests/:id
// @access  Private (Admin, Inventory Manager, Supplier - only their own)
export const getSupplierItemRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user.role?.name;
    const userId = req.user.id;

    const request = await SupplierItemRequest.findByPk(id, {
        include: [
            {
                model: SupplierItem,
                include: [Supplier]
            },
            {
                model: User,
                attributes: ['id', 'name', 'email']
            }
        ]
    });

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
    }

    // Authorization check for suppliers
    if (userRole === 'Supplier') {
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier || request.supplier_id !== supplier.id) {
            res.status(403);
            throw new Error('Not authorized to access this request');
        }
    }

    res.json({
        success: true,
        data: request
    });
});

// @desc    Update supplier item request status (for suppliers)
// @route   PUT /api/supplier-item-requests/:id/status
// @access  Private (Supplier - only their own requests)
export const updateSupplierItemRequestStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason, supplier_quote, notes_from_supplier } = req.body;
    const userId = req.user.id;

    // Verify user is a supplier
    const supplier = await Supplier.findOne({ where: { user_id: userId } });
    if (!supplier) {
        res.status(403);
        throw new Error('Only suppliers can update request status');
    }

    const request = await SupplierItemRequest.findByPk(id, {
        include: [
            {
                model: SupplierItem,
                include: [Supplier]
            },
            {
                model: User,
                attributes: ['id', 'name', 'email']
            }
        ]
    });

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
    }

    // Verify the request belongs to this supplier
    if (request.supplier_id !== supplier.id) {
        res.status(403);
        throw new Error('Not authorized to update this request');
    }

    // Validate status transition
    if (request.status !== 'pending' && status === 'pending') {
        res.status(400);
        throw new Error('Cannot revert to pending status');
    }

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status value. Allowed: approved, rejected, cancelled');
    }

    // Validate rejection reason
    if (status === 'rejected' && !rejection_reason) {
        res.status(400);
        throw new Error('Rejection reason is required when rejecting a request');
    }

    // Update the request
    request.status = status;
    if (rejection_reason) request.rejection_reason = rejection_reason;
    if (supplier_quote) request.supplier_quote = supplier_quote;
    if (notes_from_supplier) request.notes_from_supplier = notes_from_supplier;

    await request.save();

    // Refresh to get updated data
    await request.reload();

    // Send notification to requester
    try {
        await sendStatusUpdateNotification(request);
    } catch (emailError) {
        console.error('Failed to send status update notification:', emailError);
    }

    res.json({
        success: true,
        data: request,
        message: `Request ${status} successfully`
    });
});

// @desc    Cancel a supplier item request
// @route   PUT /api/supplier-item-requests/:id/cancel
// @access  Private (Admin, Inventory Manager - only their own requests)
export const cancelSupplierItemRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.name;

    const request = await SupplierItemRequest.findByPk(id);

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
    }

    // Authorization check
    if (userRole !== 'Admin' && userRole !== 'Inventory Manager') {
        res.status(403);
        throw new Error('Not authorized to cancel requests');
    }

    if (userRole === 'Inventory Manager' && request.created_by !== userId) {
        res.status(403);
        throw new Error('Can only cancel your own requests');
    }

    if (request.status !== 'pending') {
        res.status(400);
        throw new Error('Only pending requests can be cancelled');
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
        success: true,
        data: request,
        message: 'Request cancelled successfully'
    });
});

// @desc    Delete supplier item request
// @route   DELETE /api/supplier-item-requests/:id
// @access  Private (Admin only)
export const deleteSupplierItemRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user.role?.name;

    if (userRole !== 'Admin') {
        res.status(403);
        throw new Error('Only administrators can delete requests');
    }

    const request = await SupplierItemRequest.findByPk(id);

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
    }

    await request.destroy();

    res.json({
        success: true,
        message: 'Supplier item request deleted successfully'
    });
});

// Helper function to send notification to supplier
const sendNotificationToSupplier = async (request) => {
    // Implement your email notification logic here
    const supplier = request.SupplierItem?.Supplier;
    if (supplier && supplier.email) {
        await sendEmailNotification({
            to: supplier.email,
            subject: 'New Item Request Received',
            template: 'new-request-notification',
            data: {
                supplierName: supplier.company_name,
                itemName: request.SupplierItem?.name,
                quantity: request.quantity,
                urgency: request.urgency,
                notes: request.notes_from_requester,
                requestId: request.id
            }
        });
    }
};

// Helper function to send status update notification
const sendStatusUpdateNotification = async (request) => {
    const requester = await User.findByPk(request.created_by);
    if (requester && requester.email) {
        await sendEmailNotification({
            to: requester.email,
            subject: `Your Item Request has been ${request.status}`,
            template: 'request-status-update',
            data: {
                requesterName: requester.name,
                status: request.status,
                itemName: request.SupplierItem?.name,
                rejectionReason: request.rejection_reason,
                supplierQuote: request.supplier_quote,
                requestId: request.id
            }
        });
    }
};
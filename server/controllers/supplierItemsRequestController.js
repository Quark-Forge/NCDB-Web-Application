import asyncHandler from 'express-async-handler';
import { SupplierItem, SupplierItemRequest, User, Supplier, Product } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

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

    // Send notification to supplier
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

// @desc    Get all supplier item requests (FOR ADMINS/MANAGERS)
// @route   GET /api/supplier-item-requests
// @access  Private (Admin, Inventory Manager)
export const getSupplierItemRequests = asyncHandler(async (req, res) => {
    const { status, page, limit, supplier_id, search } = req.query;
    const userRole = req.user.role?.name;

    let whereClause = {};

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
        whereClause.status = status;
    }

    // Handle search
    if (search) {
        whereClause[Op.or] = [
            { '$SupplierItem.name$': { [Op.like]: `%${search}%` } },
            { '$SupplierItem.description$': { [Op.like]: `%${search}%` } },
            { '$SupplierItem.Supplier.company_name$': { [Op.like]: `%${search}%` } },
            { '$User.name$': { [Op.like]: `%${search}%` } },
            { notes_from_requester: { [Op.like]: `%${search}%` } },
            { '$SupplierItem.Product.name$': { [Op.like]: `%${search}%` } } // Add product name to search
        ];
    }

    // Admins/Managers can filter by specific supplier if provided
    if (supplier_id) {
        whereClause.supplier_id = supplier_id;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: requests } = await SupplierItemRequest.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: SupplierItem,
                include: [
                    Supplier,
                    {
                        model: Product,
                        attributes: ['id', 'name', 'sku', 'description']
                    }
                ]
            },
            {
                model: User,
                attributes: ['id', 'name', 'email']
            }
        ],
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset,
        distinct: true
    });

    // Transform the response to include product name at the root level for easy access
    const transformedRequests = requests.map(request => {
        const requestData = request.toJSON();

        // Add product information directly to the request object
        if (requestData.SupplierItem?.Product) {
            requestData.product_name = requestData.SupplierItem.Product.name;
            requestData.product_sku = requestData.SupplierItem.Product.sku;
            requestData.product_description = requestData.SupplierItem.Product.description;
        }

        return requestData;
    });

    res.json({
        success: true,
        data: transformedRequests,
        count: count,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(count / limitNum)
        }
    });
});

// @desc    Get supplier's own requests (FOR SUPPLIERS)
// @route   GET /api/supplier-item-requests/my-requests
// @access  Private (Supplier)
export const getMySupplierItemRequests = asyncHandler(async (req, res) => {
    const { status, page, limit, search } = req.query;
    const userId = req.user.id;

    // Get user details first
    const user = await User.findByPk(userId);
    if (!user) {
        res.status(403);
        throw new Error('User not found');
    }

    // Find supplier by email (since suppliers have email field)
    const supplier = await Supplier.findOne({
        where: {
            email: user.email
        }
    });

    if (!supplier) {
        res.status(403);
        throw new Error(`Supplier profile not found for email: ${user.email}. Please ensure your user email matches a supplier email.`);
    }

    let whereClause = {
        supplier_id: supplier.id // Only show requests for this supplier
    };

    // Filter by status if provided
    if (status && status !== 'all' && ['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
        whereClause.status = status;
    }

    // Handle search
    if (search) {
        whereClause[Op.or] = [
            { '$SupplierItem.name$': { [Op.like]: `%${search}%` } },
            { '$SupplierItem.description$': { [Op.like]: `%${search}%` } },
            { '$User.name$': { [Op.like]: `%${search}%` } },
            { notes_from_requester: { [Op.like]: `%${search}%` } }
        ];
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: requests } = await SupplierItemRequest.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: SupplierItem,
                include: [Supplier]
            },
            {
                model: User,
                attributes: ['id', 'name', 'email']
            }
        ],
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset,
        distinct: true
    });

    // Get stats for supplier dashboard - FIXED: Now using imported sequelize
    const stats = await SupplierItemRequest.findAll({
        where: { supplier_id: supplier.id },
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    });

    const formattedStats = stats.reduce((acc, curr) => {
        acc[curr.status] = parseInt(curr.count);
        acc.total = (acc.total || 0) + parseInt(curr.count);
        return acc;
    }, {});

    res.json({
        success: true,
        data: requests,
        count: count,
        stats: formattedStats,
        supplier: {
            id: supplier.id,
            name: supplier.name,
            email: supplier.email
        },
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(count / limitNum)
        }
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
        // Get user details first
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(403);
            throw new Error('User not found');
        }

        // Find supplier by email
        const supplier = await Supplier.findOne({
            where: {
                email: user.email
            }
        });

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

    // Get user details first
    const user = await User.findByPk(userId);
    if (!user) {
        res.status(403);
        throw new Error('User not found');
    }

    // Find supplier by email
    const supplier = await Supplier.findOne({
        where: {
            email: user.email
        }
    });

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

    // Validate supplier quote for approval
    if (status === 'approved' && !supplier_quote) {
        res.status(400);
        throw new Error('Supplier quote is required when approving a request');
    }

    // Update the request
    const updateData = {
        status,
        ...(rejection_reason && { rejection_reason }),
        ...(supplier_quote && { supplier_quote: parseFloat(supplier_quote) }),
        ...(notes_from_supplier && { notes_from_supplier })
    };

    await SupplierItemRequest.update(updateData, {
        where: { id }
    });

    // Get updated request
    const updatedRequest = await SupplierItemRequest.findByPk(id, {
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

    // Send notification to requester
    try {
        await sendStatusUpdateNotification(updatedRequest);
    } catch (emailError) {
        console.error('Failed to send status update notification:', emailError);
    }

    res.json({
        success: true,
        data: updatedRequest,
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

    await SupplierItemRequest.update(
        { status: 'cancelled' },
        { where: { id } }
    );

    // Get updated request
    const updatedRequest = await SupplierItemRequest.findByPk(id, {
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

    res.json({
        success: true,
        data: updatedRequest,
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

    await SupplierItemRequest.destroy({
        where: { id }
    });

    res.json({
        success: true,
        message: 'Supplier item request deleted successfully'
    });
});

// @desc    Get request statistics
// @route   GET /api/supplier-item-requests/statistics
// @access  Private
export const getRequestStatistics = asyncHandler(async (req, res) => {
    const userRole = req.user.role?.name;
    const userId = req.user.id;

    let whereClause = {};

    // Apply supplier filter if user is a supplier
    if (userRole === 'Supplier') {
        // Get user details first
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(403);
            throw new Error('User not found');
        }

        // Find supplier by email
        const supplier = await Supplier.findOne({
            where: {
                email: user.email
            }
        });

        if (supplier) {
            whereClause.supplier_id = supplier.id;
        }
    }

    // Get status counts - FIXED: Now using imported sequelize
    const statusCounts = await SupplierItemRequest.findAll({
        where: whereClause,
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    });

    // Calculate revenue from approved requests - FIXED: Now using imported sequelize
    const revenueResult = await SupplierItemRequest.findOne({
        where: {
            ...whereClause,
            status: 'approved'
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('supplier_quote')), 'totalRevenue']
        ],
        raw: true
    });

    const stats = statusCounts.reduce((acc, curr) => {
        acc[curr.status] = parseInt(curr.count);
        acc.total = (acc.total || 0) + parseInt(curr.count);
        return acc;
    }, {});

    stats.totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

    res.json({
        success: true,
        data: stats
    });
});

// Helper function to send notification to supplier
const sendNotificationToSupplier = async (request) => {
    // Implement your email notification logic here
    const supplier = request.SupplierItem?.Supplier;
    if (supplier && supplier.email) {
        console.log(`Sending notification to supplier: ${supplier.name}`);
        console.log(`Request details: ${request.quantity} x ${request.SupplierItem?.name}`);

        // Uncomment and implement your actual email service:
        /*
        await sendEmailNotification({
            to: supplier.email,
            subject: 'New Item Request Received',
            template: 'new-request-notification',
            data: {
                supplierName: supplier.name,
                itemName: request.SupplierItem?.name,
                quantity: request.quantity,
                urgency: request.urgency,
                notes: request.notes_from_requester,
                requestId: request.id
            }
        });
        */
    }
};

// Helper function to send status update notification
const sendStatusUpdateNotification = async (request) => {
    const requester = await User.findByPk(request.created_by);
    if (requester && requester.email) {
        console.log(`Sending status update to requester: ${requester.name}`);
        console.log(`Status: ${request.status} for request ID: ${request.id}`);

        // Uncomment and implement your actual email service:
        /*
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
        */
    }
};
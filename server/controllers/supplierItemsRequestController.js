import asyncHandler from 'express-async-handler';
import { SupplierItem, SupplierItemRequest, User, Supplier, Product } from '../models/index.js';
import { Op, where } from 'sequelize';
import sequelize from 'sequelize';
import { sendUserCredentials } from '../utils/sendEmail.js';
import {
    supplierRequestNotificationTemplate,
    requestStatusUpdateTemplate,
    requestApprovedTemplate,
    requestRejectedTemplate,
    requestCancelledTemplate
} from '../templates/supplierRequestEmailTemplates.js';

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
        include: [
            {
                model: Supplier,
                include: [
                    {
                        model: User,
                        as: 'user'
                    }
                ]
            },
            {
                model: Product
            }
        ]
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
            { '$SupplierItem.Product.name$': { [Op.like]: `%${search}%` } }
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
            { '$SupplierItem.description$': { [Op.like]: `%${search}%` } },
            { '$User.name$': { [Op.like]: `%${search}%` } },
            { notes_from_requester: { [Op.like]: `%${search}%` } },
            { '$SupplierItem.Product.name$': { [Op.like]: `%${search}%` } }
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

    // Get stats for supplier dashboard
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
        data: transformedRequests,
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

    const request = await SupplierItemRequest.findByPk(id, {
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
        ]
    });

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
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

// @desc    Update supplier item request (for admins/managers)
// @route   PUT /api/supplier-item-requests/:id
// @access  Private (Admin, Inventory Manager)
export const updateSupplierItemRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, urgency, notes_from_requester } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!quantity && !urgency && !notes_from_requester) {
        res.status(400);
        throw new Error('At least one field (quantity, urgency, or notes) must be provided for update');
    }

    const request = await SupplierItemRequest.findByPk(id, {
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
        ]
    });

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
    }

    // Only allow updates for pending requests
    if (request.status !== 'pending') {
        res.status(400);
        throw new Error('Only pending requests can be updated');
    }

    // Validate quantity
    if (quantity && quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    // Prepare update data
    const updateData = {};
    if (quantity) updateData.quantity = quantity;
    if (urgency) updateData.urgency = urgency;
    if (notes_from_requester !== undefined) updateData.notes_from_requester = notes_from_requester;

    // Update the request
    await SupplierItemRequest.update(updateData, {
        where: { id }
    });

    // Get updated request
    const updatedRequest = await SupplierItemRequest.findByPk(id, {
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
        ]
    });

    res.json({
        success: true,
        data: updatedRequest,
        message: 'Supplier item request updated successfully'
    });
});

// @desc    Cancel a supplier item request
// @route   PUT /api/supplier-item-requests/:id/cancel
// @access  Private (Admin, Inventory Manager - only their own requests)
export const cancelSupplierItemRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await SupplierItemRequest.findByPk(id, {
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
        ]
    });

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
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
        ]
    });

    // Send cancellation notification
    try {
        await sendCancellationNotification(updatedRequest);
    } catch (emailError) {
        console.error('Failed to send cancellation notification:', emailError);
    }

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

    const request = await SupplierItemRequest.findByPk(id);

    if (!request) {
        res.status(404);
        throw new Error('Supplier item request not found');
    }

    if (request.status !== 'cancelled' && request.status !== 'pending') {
        res.status(400);
        throw new Error(`Cannot delete request with status "${request.status}". Only cancelled or pending requests can be deleted.`);
    }

    await SupplierItemRequest.destroy({
        where: { id },
        force: true
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
    const userId = req.user.id;

    let whereClause = {};

    // Apply supplier filter if user is a supplier
    const user = await User.findByPk(userId);
    if (user) {
        const supplier = await Supplier.findOne({
            where: { email: user.email }
        });

        if (supplier) {
            whereClause.supplier_id = supplier.id;
        }
    }

    // Get status counts
    const statusCounts = await SupplierItemRequest.findAll({
        where: whereClause,
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    });

    // Get total request count (including all statuses)
    const totalCount = await SupplierItemRequest.count({
        where: whereClause
    });

    // Calculate revenue from approved requests - FIXED VERSION
    const revenueResult = await SupplierItemRequest.findOne({
        where: {
            ...whereClause,
            status: 'approved'
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.literal('supplier_quote * quantity')), 'totalRevenue']
        ],
        raw: true
    });

    const stats = statusCounts.reduce((acc, curr) => {
        acc[curr.status] = parseInt(curr.count);
        return acc;
    }, {});

    // Add total count to stats
    stats.total = totalCount;
    stats.totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

    res.json({
        success: true,
        data: stats
    });
});
// Helper function to send notification to supplier
const sendNotificationToSupplier = async (request) => {
    const supplier = request.SupplierItem?.Supplier;
    if (supplier && supplier.email) {
        try {
            const subject = `New Item Request Received - Request #${request.id}`;
            const html = supplierRequestNotificationTemplate(request, supplier);

            await sendUserCredentials(supplier.email, subject, html);
            console.log(`Notification sent to supplier: ${supplier.name}`);
        } catch (emailError) {
            console.error('Failed to send supplier notification:', emailError);
            throw emailError;
        }
    }
};

// Helper function to send status update notification
const sendStatusUpdateNotification = async (request) => {
    const requester = await User.findByPk(request.created_by);
    if (requester && requester.email) {
        try {
            let subject, html;

            switch (request.status) {
                case 'approved':
                    subject = `Your Item Request has been Approved - Request #${request.id}`;
                    html = requestApprovedTemplate(request, requester);
                    break;
                case 'rejected':
                    subject = `Your Item Request has been Rejected - Request #${request.id}`;
                    html = requestRejectedTemplate(request, requester);
                    break;
                case 'cancelled':
                    subject = `Your Item Request has been Cancelled - Request #${request.id}`;
                    html = requestCancelledTemplate(request, requester);
                    break;
                default:
                    subject = `Your Item Request Status Updated - Request #${request.id}`;
                    html = requestStatusUpdateTemplate(request, requester);
            }

            await sendUserCredentials(requester.email, subject, html);
            console.log(`Status update sent to requester: ${requester.name}`);
        } catch (emailError) {
            console.error('Failed to send status update notification:', emailError);
            throw emailError;
        }
    }
};

// Helper function to send cancellation notification
const sendCancellationNotification = async (request) => {
    const supplier = request.SupplierItem?.Supplier;
    if (supplier && supplier.email) {
        try {
            const subject = `Item Request Cancelled - Request #${request.id}`;
            const html = requestCancelledTemplate(request, supplier);

            await sendUserCredentials(supplier.email, subject, html);
            console.log(`Cancellation notification sent to supplier: ${supplier.name}`);
        } catch (emailError) {
            console.error('Failed to send cancellation notification:', emailError);
            throw emailError;
        }
    }
};
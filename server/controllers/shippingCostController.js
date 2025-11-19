import { ShippingCost, Address, Order } from "../models/index.js";
import asyncHandler from "express-async-handler";

// Validation helper function
const validateShippingCost = (data) => {
    const errors = [];
    if (!data.city) errors.push("City is required");
    if (!data.cost) errors.push("Cost is required");
    if (data.cost && isNaN(data.cost)) errors.push("Cost must be a number");
    if (data.estimated_delivery_days && isNaN(data.estimated_delivery_days)) {
        errors.push("Estimated delivery days must be a number");
    }
    return errors;
};

export const createShippingCost = asyncHandler(async (req, res) => {
    const { city, cost, estimated_delivery_days } = req.body;

    // Validate input
    const validationErrors = validateShippingCost(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: validationErrors
        });
    }

    // Check if city already exists
    const existingCost = await ShippingCost.findOne({ where: { city } });
    if (existingCost) {
        return res.status(400).json({
            success: false,
            message: "Shipping cost for this city already exists"
        });
    }

    const shippingCost = await ShippingCost.create({
        city,
        cost: parseFloat(cost),
        estimated_delivery_days: parseInt(estimated_delivery_days) || 1
    });

    res.status(201).json({
        success: true,
        data: shippingCost,
        message: "Shipping cost created successfully"
    });
});

export const getShippingCosts = asyncHandler(async (req, res) => {
    const shippingCosts = await ShippingCost.findAll({
        order: [['city', 'ASC']] // Default sorting by city name
    });

    res.status(200).json({
        success: true,
        data: shippingCosts,
        message: shippingCosts.length
            ? "Shipping costs retrieved successfully"
            : "No shipping costs found"
    });
});

export const updateShippingCost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { city, cost, estimated_delivery_days } = req.body;

    // Validate ID exists
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Shipping cost ID is required"
        });
    }

    // Basic validation
    if (!city || !cost) {
        return res.status(400).json({
            success: false,
            message: "City and cost are required fields"
        });
    }

    try {
        const shippingCost = await ShippingCost.findByPk(id);
        if (!shippingCost) {
            return res.status(404).json({
                success: false,
                message: "Shipping cost not found"
            });
        }

        // Check for duplicate city if city is being changed
        if (city && city !== shippingCost.city) {
            const existing = await ShippingCost.findOne({ where: { city } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Shipping cost for this city already exists"
                });
            }
        }

        // Prepare update
        const updated = await shippingCost.update({
            city,
            cost: parseFloat(cost),
            estimated_delivery_days: estimated_delivery_days
                ? parseInt(estimated_delivery_days)
                : null
        });

        return res.status(200).json({
            success: true,
            data: updated,
            message: "Shipping cost updated successfully"
        });

    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update shipping cost",
            error: error.message
        });
    }
});

export const deleteShippingCost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const shippingCost = await ShippingCost.findByPk(id);
    if (!shippingCost) {
        return res.status(404).json({
            success: false,
            message: "Shipping cost not found"
        });
    }

    // Check if there are any addresses using this shipping cost
    const addressesWithShippingCost = await Address.findAll({
        where: {
            shipping_cost_id: id
        },
        attributes: ['id']
    });

    if (addressesWithShippingCost.length > 0) {
        const addressIds = addressesWithShippingCost.map(addr => addr.id);

        // Check if any orders use these addresses
        const ordersWithShippingCost = await Order.findOne({
            where: {
                address_id: addressIds
            }
        });

        if (ordersWithShippingCost) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete shipping cost. There are existing orders associated with addresses using this shipping city."
            });
        }
    }

    await shippingCost.destroy();

    res.status(200).json({
        success: true,
        message: "Shipping cost deleted successfully"
    });
});
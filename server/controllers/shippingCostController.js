import { ShippingCost } from "../models/index.js";
import asyncHandler from "express-async-handler";

export const createShippingCost = asyncHandler(async (req, res) => {
    try {
        const { city, cost, estimated_delivery_date } = req.body;

        if (!city || !cost) {
            return res.status(400).json({ message: 'Name and cost are required.' });
        }

        const shippingCost = await ShippingCost.create({
            city,
            cost,
            estimated_delivery_date
        });

        if (!shippingCost) {
            res.status(500);
            throw new Error('Failed to create shipping cost.');
        }

        return res.status(201).json(shippingCost);
    } catch (error) {
        console.error('Error creating shipping cost:', error);
        res.status(500);
        throw new Error('Internal server error');
    }
});

export const getShippingCosts = asyncHandler(async (req, res) => {
    try {
        const shippingCosts = await ShippingCost.findAll();

        if (!shippingCosts || shippingCosts.length === 0) {
            res.status(404);
            throw new Error('No shipping costs found.');
        }

        return res.status(200).json({
            success: true,
            data: shippingCosts,
            message: 'Shipping costs retrieved successfully.'
        });
    } catch (error) {
        console.error('Error fetching shipping costs:', error);
        res.status(500);
        throw new Error('Internal server error');
    }
});
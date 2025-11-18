import asyncHandler from "express-async-handler";
import { Address, ShippingCost } from "../models/index.js";

export const getShippingAddress = asyncHandler(async (req, res) => {
    try {
        const user_id = req.user.id;
        const addresses = await Address.findAll({
            where: { user_id },
            include: [{
                model: ShippingCost,
            }],
        });

        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ message: 'No shipping addresses found for this user.' });
        }

        return res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching shipping addresses:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export const createShippingAddress = asyncHandler(async (req, res) => {
    try {
        const user_id = req.user.id;
        const {
            shipping_name,
            shipping_phone,
            address_line1,
            address_line2,
            city,
            postal_code,
            shipping_cost_id
        } = req.body;

        if (!user_id || !shipping_name || !shipping_phone || !address_line1 || !city || !postal_code || !shipping_cost_id) {
            return res.status(400).json({ message: 'All fields are required except address_line2 and email.' });
        }

        const newAddress = await Address.create({
            user_id,
            shipping_name,
            shipping_phone,
            address_line1,
            address_line2,
            city,
            postal_code,
            shipping_cost_id
        });

        // Fetch the created address with shipping cost
        const createdAddress = await Address.findByPk(newAddress.id, {
            include: [{
                model: ShippingCost,
            }],
        });

        return res.status(201).json(createdAddress);
    } catch (error) {
        console.error('Error creating shipping address:', error);
        res.status(500);
        throw new Error('Internal server error');
    }
});

export const updateShippingAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const {
            shipping_name,
            shipping_phone,
            address_line1,
            address_line2,
            city,
            postal_code,
            shipping_cost_id
        } = req.body;

        // Check if address exists and belongs to user
        const address = await Address.findOne({
            where: { id, user_id }
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Update address
        await Address.update({
            shipping_name,
            shipping_phone,
            address_line1,
            address_line2,
            city,
            postal_code,
            shipping_cost_id
        }, {
            where: { id, user_id }
        });

        // Fetch updated address with shipping cost
        const updatedAddress = await Address.findByPk(id, {
            include: [{
                model: ShippingCost,
            }],
        });

        return res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating shipping address:', error);
        res.status(500);
        throw new Error('Internal server error');
    }
});

export const deleteShippingAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Check if address exists and belongs to user
        const address = await Address.findOne({
            where: { id, user_id }
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Delete address
        await Address.destroy({
            where: { id, user_id }
        });

        return res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipping address:', error);
        res.status(500);
        throw new Error('Internal server error');
    }
});
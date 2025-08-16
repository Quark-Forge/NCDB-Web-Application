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

        if (!user_id || !shipping_phone || !address_line1 || !city || !postal_code) {
            return res.status(400).json({ message: 'All fields are required except address_line2.' });
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

        return res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error creating shipping address:', error);
        res.status(500);
        throw new Error('Internal server error');
    }
});
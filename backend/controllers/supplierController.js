import asyncHandler from "express-async-handler";
import Supplier from "../models/suppliers.js";


export const addSupplier = asyncHandler(async (req, res) => {

    const { name, contact_number, address } = req.body;
    if (!name || !contact_number || !address) {
        res.status(400);
        throw new Error('All fields are required');
    }
    const existingSupplier = await Supplier.findOne({ where: { contact_number } });

    if (existingSupplier) {
        res.status(400);
        throw new Error('supplier already exist');
    }
    const newSupplier = await Supplier.create({
        name,
        contact_number,
        address,
    });
    res.status(201).json({
        message: 'Supplier created',
        supplier: {
            id: newSupplier.id,
            name,
            contact_number,
            address
        },
    });
});

export const updateSupplier = asyncHandler(async (req, res) => {
    const { name, address, contact_number } = req.body;
    if (!name || !contact_number || !address) {
        res.status(400);
        throw new Error('All fields are required');
    }
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }
    supplier.name = name || supplier.name;
    supplier.address = address || supplier.address;
    supplier.contact_number = contact_number || supplier.contact_number;

    await supplier.save();

    res.status(200).json({
        message: 'Updated Succecsfully',
        supplier: {
            id: supplier.id,
            name: supplier.name,
            contact_number: supplier.contact_number,
            address: supplier.address,
        }
    });
});

export const removeSupplier = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            res.send(400);
            throw new Error('Supplier not found');
        }
        await supplier.destroy();
        res.status(200).json({ message: 'Supplier removed successfully' });
    } catch (error) {
        throw new Error('Error removing supplier')
    }
});
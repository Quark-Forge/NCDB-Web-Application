import { useState } from 'react';
import { toast } from 'react-toastify';
import { downloadShippingLabel, openShippingLabelInNewTab, generateTrackingNumber } from '../utils/shippingLabelGenerator';

export const useShippingLabel = () => {
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);

    const createShippingLabel = async (order, packageDetails = {}) => {
        setIsCreatingLabel(true);
        try {
            // Generate tracking number
            const trackingNumber = generateTrackingNumber();

            // Create shipping label
            downloadShippingLabel(order, trackingNumber, packageDetails);

            // You can also save the shipping info to your backend here
            // await saveShippingInfo(order.id, trackingNumber, packageDetails);

            toast.success(`Shipping label created! Tracking: ${trackingNumber}`);

            return {
                success: true,
                trackingNumber,
                packageDetails
            };
        } catch (error) {
            console.error('Error creating shipping label:', error);
            toast.error('Failed to create shipping label');
            return {
                success: false,
                error: error.message
            };
        } finally {
            setIsCreatingLabel(false);
        }
    };

    const previewShippingLabel = (order, packageDetails = {}) => {
        try {
            const trackingNumber = generateTrackingNumber();
            openShippingLabelInNewTab(order, trackingNumber, packageDetails);
        } catch (error) {
            console.error('Error previewing shipping label:', error);
            toast.error('Failed to preview shipping label');
        }
    };

    return {
        createShippingLabel,
        previewShippingLabel,
        isCreatingLabel
    };
};
// Generates a unique order number with format: ORD-YYYYMMDD-XXXX
export const generateOrderNumber = () => {
    const now = new Date();
    
    // Format date as YYYYMMDD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Generate random 4-digit number
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    
    return `ORD-${dateStr}-${randomNum}`;
};

// Validates an order number format

export const validateOrderNumber = (orderNumber) => {
    const regex = /^ORD-\d{8}-\d{4}$/;
    return regex.test(orderNumber);
};
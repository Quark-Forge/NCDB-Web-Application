export const validateField = (name, value, formData = {}) => {
    let errorMessage = '';

    switch (name) {
        case 'name':
            if (!value.trim()) {
                errorMessage = 'Product name is required';
            } else if (value.trim().length < 2) {
                errorMessage = 'Product name must be at least 2 characters';
            } else if (value.trim().length > 100) {
                errorMessage = 'Product name must be less than 100 characters';
            }
            break;

        case 'sku':
            if (!value.trim()) {
                errorMessage = 'SKU is required';
            } else if (!/^[A-Z0-9-_]+$/i.test(value.trim())) {
                errorMessage = 'SKU can only contain letters, numbers, hyphens, and underscores';
            } else if (value.trim().length < 3) {
                errorMessage = 'SKU must be at least 3 characters';
            } else if (value.trim().length > 50) {
                errorMessage = 'SKU must be less than 50 characters';
            }
            break;

        case 'supplier_sku':
            if (!value.trim()) {
                errorMessage = 'Supplier SKU is required';
            } else if (value.trim().length > 50) {
                errorMessage = 'Supplier SKU must be less than 50 characters';
            }
            break;

        case 'price':
        case 'purchase_price':
            if (!value) {
                errorMessage = `${name.replace('_', ' ')} is required`;
            } else if (isNaN(value) || parseFloat(value) <= 0) {
                errorMessage = `${name.replace('_', ' ')} must be greater than 0`;
            } else if (parseFloat(value) > 99999999.99) {
                errorMessage = `${name.replace('_', ' ')} must be less than 100,000,000`;
            }
            break;

        case 'discount_price':
            if (value && (isNaN(value) || parseFloat(value) < 0)) {
                errorMessage = 'Discount price cannot be negative';
            } else if (value && formData.price && parseFloat(value) >= parseFloat(formData.price)) {
                errorMessage = 'Discount price must be less than selling price';
            } else if (value && parseFloat(value) > 99999999.99) {
                errorMessage = 'Discount price must be less than 100,000,000';
            }
            break;

        case 'quantity_per_unit':
            if (!value) {
                errorMessage = 'Quantity per unit is required';
            } else if (isNaN(value) || parseFloat(value) <= 0) {
                errorMessage = 'Quantity per unit must be greater than 0';
            } else if (parseFloat(value) > 99999999.99) {
                errorMessage = 'Quantity per unit must be less than 100,000,000';
            }
            break;

        case 'stock_level':
            if (value && (isNaN(value) || parseInt(value) < 0)) {
                errorMessage = 'Stock level cannot be negative';
            } else if (value && parseInt(value) > 999999999) {
                errorMessage = 'Stock level must be less than 1,000,000,000';
            }
            break;

        case 'expiry_days':
        case 'lead_time_days':
            if (value && (isNaN(value) || parseInt(value) < 0)) {
                errorMessage = `${name.replace('_', ' ')} cannot be negative`;
            } else if (value && parseInt(value) > 9999) {
                errorMessage = `${name.replace('_', ' ')} must be less than 10,000`;
            }
            break;

        case 'unit_symbol':
            if (!value.trim()) {
                errorMessage = 'Unit symbol is required';
            } else if (value.trim().length > 20) {
                errorMessage = 'Unit symbol must be less than 20 characters';
            }
            break;

        case 'category_id':
            if (!value) {
                errorMessage = 'Category is required';
            }
            break;

        case 'supplier_id':
            if (!value) {
                errorMessage = 'Supplier is required';
            }
            break;

        case 'description':
            if (value && value.trim().length > 1000) {
                errorMessage = 'Description must be less than 1000 characters';
            }
            break;

        case 'base_image_url':
        case 'image_url':
            if (value && value.trim()) {
                try {
                    new URL(value.trim());
                    if (!value.trim().match(/^https?:\/\//)) {
                        errorMessage = 'URL must start with http:// or https://';
                    }
                } catch {
                    errorMessage = 'Please enter a valid URL';
                }
            }
            break;

        default:
            break;
    }

    return errorMessage;
};

export const validateAllFields = (formData) => {
    const allErrors = {};
    Object.keys(formData).forEach(key => {
        const error = validateField(key, formData[key], formData);
        if (error) allErrors[key] = error;
    });
    return allErrors;
};

export const isFormValid = (formData, errors) => {
    // For edit form, we only need these required fields
    const requiredFields = [
        'name',
        'price',
        'quantity_per_unit',
        'unit_symbol',
        'category_id'
    ];

    // Check if all required fields have values
    const hasAllValues = requiredFields.every(field =>
        formData[field] && formData[field].toString().trim() !== ''
    );

    // Check if there are no validation errors
    const hasNoErrors = Object.keys(errors).length === 0;

    return hasAllValues && hasNoErrors;
};
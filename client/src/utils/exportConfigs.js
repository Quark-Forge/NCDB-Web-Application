export const orderExportConfig = {
    headers: [
        { key: 'order_number', label: 'Order Number' },
        { key: 'createdAt', label: 'Order Date' },
        {
            key: 'User',
            parentKey: 'User',
            nestedKey: 'name',
            label: 'Customer Name'
        },
        {
            key: 'User',
            parentKey: 'User',
            nestedKey: 'email',
            label: 'Customer Email'
        },
        { key: 'status', label: 'Status' },
        {
            key: 'payment_status',
            label: 'Payment Status',
            formatter: (value, item) => {
                if (!item.payment) return 'pending';
                return item.payment.payment_status || 'pending';
            }
        },
        { key: 'total_amount', label: 'Total Amount' },
        {
            key: 'shipping_address',
            label: 'Shipping Address',
            formatter: (value, item) => {
                return item.shipping_address?.address_line1 || 'N/A';
            }
        },
        {
            key: 'items_count',
            label: 'Items Count',
            formatter: (value, item) => {
                return item.order_items?.length || 0;
            }
        }
    ],
    dateFields: ['createdAt'],
    filename: 'orders'
};

export const productExportConfig = {
    headers: [
        { key: 'name', label: 'Product Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price' },
        { key: 'stock_level', label: 'Stock Level' },
        { key: 'status', label: 'Status' },
        {
            key: 'supplier_name',
            label: 'Supplier',
            formatter: (value, item) => {
                return item.Supplier?.name || 'N/A';
            }
        },
        { key: 'createdAt', label: 'Created Date' }
    ],
    dateFields: ['createdAt'],
    filename: 'products'
};

export const customerExportConfig = {
    headers: [
        { key: 'name', label: 'Customer Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        {
            key: 'order_count',
            label: 'Total Orders',
            formatter: (value, item) => {
                return item.orders?.length || 0;
            }
        },
        {
            key: 'total_spent',
            label: 'Total Spent',
            formatter: (value, item) => {
                return item.orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
            }
        },
        { key: 'createdAt', label: 'Registration Date' }
    ],
    dateFields: ['createdAt'],
    filename: 'customers'
};

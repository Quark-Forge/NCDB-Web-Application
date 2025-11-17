import React from 'react';

const PrintableInventoryReport = React.forwardRef(({ stock, totalItems, filters }, ref) => {
    const getStockStatus = (stockLevel) => {
        if (stockLevel === 0) return "Out of Stock";
        if (stockLevel < 5) return "Critical";
        if (stockLevel < 10) return "Low Stock";
        return "In Stock";
    };

    const getStockSummary = () => {
        const summary = {
            inStock: stock.filter(item => item.stockLevel >= 10).length,
            lowStock: stock.filter(item => item.stockLevel > 0 && item.stockLevel < 10).length,
            critical: stock.filter(item => item.stockLevel > 0 && item.stockLevel < 5).length,
            outOfStock: stock.filter(item => item.stockLevel === 0).length,
            totalValue: stock.reduce((sum, item) => sum + (item.price * item.stockLevel), 0)
        };
        return summary;
    };

    const summary = getStockSummary();

    return (
        <div ref={ref} className="p-6">
            <div className="print-header">
                <h1>Inventory Report</h1>
                <p>NCDB Mart - Inventory Management System</p>
                <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                <p>Total Items: <strong>{totalItems}</strong></p>

                {/* Stock Summary */}
                <div className="stock-summary mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Stock Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-green-600">In Stock: </span>
                            {summary.inStock}
                        </div>
                        <div>
                            <span className="font-medium text-yellow-600">Low Stock: </span>
                            {summary.lowStock}
                        </div>
                        <div>
                            <span className="font-medium text-red-600">Critical: </span>
                            {summary.critical}
                        </div>
                        <div>
                            <span className="font-medium text-red-700">Out of Stock: </span>
                            {summary.outOfStock}
                        </div>
                    </div>
                    {summary.totalValue > 0 && (
                        <div className="mt-2">
                            <span className="font-medium text-blue-600">Total Inventory Value: </span>
                            Rs {summary.totalValue.toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Supplier</th>
                        <th>SKU</th>
                        <th>Stock Level</th>
                        <th>Status</th>
                        <th>Purchase Price</th>
                        <th>Price</th>
                        <th>Discounted Price</th>
                    </tr>
                </thead>
                <tbody>
                    {stock.map((item, index) => (
                        <tr key={index}>
                            <td>{item.productName}</td>
                            <td>{item.supplierName}</td>
                            <td>{item.supplierSku}</td>
                            <td className="text-center">{item.stockLevel}</td>
                            <td className="capitalize">{getStockStatus(item.stockLevel)}</td>
                            <td className="text-right">{item.purchasePrice ? `Rs ${item.purchasePrice}` : 'N/A'}</td>
                            <td className="text-right">{item.price ? `Rs ${item.price}` : 'N/A'}</td>
                            <td className="text-right">{item.discountedPrice ? `Rs ${item.discountedPrice}` : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Filter Information */}
            <div className="filter-info mt-6 p-3 bg-gray-50 rounded text-sm">
                <h4 className="font-semibold mb-1">Report Filters Applied:</h4>
                <div className="flex flex-wrap gap-2">
                    {filters.searchTerm && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{filters.searchTerm}"</span>
                    )}
                    {filters.inStock && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">In Stock</span>}
                    {filters.lowStock && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Low Stock</span>}
                    {filters.criticalStock && <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Critical Stock</span>}
                    {filters.outOfStock && <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">Out of Stock</span>}
                </div>
            </div>

            <div className="print-footer">
                <p>This is a computer-generated inventory report. No signature is required.</p>
                <p>NCDB Mart Inventory Management System</p>
            </div>
        </div>
    );
});

PrintableInventoryReport.displayName = 'PrintableInventoryReport';

export default PrintableInventoryReport;
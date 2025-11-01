// InventoryTable.js
import { useState, useRef } from "react";
import Card from "../../common/Card";
import { useUpdateSupplierItemMutation } from "../../../slices/supplierItemsApiSlice";
import Button from "../../common/Button";
import Badges from "../../common/Badges";
import Pagination from "../../common/Pagination";
import ExportPrintBar from "../../common/ExportPrintBar";
import PrintableInventoryReport from "./PrintableInventoryReport";
import { useExport } from "../../../hooks/useExport";
import { usePrint } from "../../../hooks/usePrint";
import { toast } from "react-toastify";

const InventoryTable = ({ stock, filters }) => {
  const [formVisible, setFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ stockLevel: 0 });
  const [updateSupplierItem, { isLoading }] = useUpdateSupplierItemMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Export and Print hooks
  const { exportToCSV, isExporting } = useExport();
  const { printRef, handlePrint } = usePrint();

  if (!stock || stock.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-r from-gray-50 to-white">
        <div className="text-gray-500 py-6">No products available in inventory</div>
      </Card>
    );
  }

  const openForm = (product) => {
    setSelectedProduct(product);
    setFormData({ stockLevel: product.stockLevel });
    setFormVisible(true);
  };

  // Apply search and stock filters
  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.productName
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());

    if (!filters.inStock && !filters.lowStock && !filters.outOfStock && !filters.criticalStock) {
      return matchesSearch;
    }

    let matchesStock = false;
    if (filters.inStock) matchesStock = matchesStock || item.stockLevel >= 10;
    if (filters.lowStock) matchesStock = matchesStock || (item.stockLevel > 0 && item.stockLevel < 10);
    if (filters.outOfStock) matchesStock = matchesStock || item.stockLevel === 0;
    if (filters.criticalStock) matchesStock = matchesStock || (item.stockLevel > 0 && item.stockLevel < 5);

    return matchesSearch && matchesStock;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStock = filteredStock.slice(startIndex, endIndex);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateSupplierItem({
        supplier_id: selectedProduct.supplierId,
        product_id: selectedProduct.productId,
        stock_level: Number(formData.stockLevel),
      }).unwrap();

      setFormVisible(false);
      toast.success("Stock level updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update stock level");
    }
  };

  const getStockStatus = (stockLevel) => {
    if (stockLevel === 0) return { variant: "danger", label: "Out of Stock" };
    if (stockLevel < 5) return { variant: "danger", label: "Critical" };
    if (stockLevel < 10) return { variant: "warning", label: "Low Stock" };
    return { variant: "success", label: "In Stock" };
  };

  // CSV Export Configuration
  const inventoryExportConfig = {
    headers: [
      { key: 'productName', label: 'Product Name' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'supplierSku', label: 'SKU' },
      { key: 'stockLevel', label: 'Stock Level' },
      {
        key: 'status',
        label: 'Stock Status',
        formatter: (value, item) => {
          const status = getStockStatus(item.stockLevel);
          return status.label;
        }
      },
      { key: 'price', label: 'Price' },
      {
        key: 'lastUpdated',
        label: 'Last Updated',
        formatter: (value, item) => {
          return item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A';
        }
      }
    ],
    dateFields: ['lastUpdated'],
    filename: 'inventory_report'
  };

  const handleExport = () => {
    exportToCSV(filteredStock, inventoryExportConfig.headers, inventoryExportConfig.filename, {
      dateFields: inventoryExportConfig.dateFields
    });
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Inventory Items</h3>
            <p className="text-gray-500 mt-1">Manage your product inventory levels</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              {filteredStock.length} of {stock.length} products
            </span>
            <ExportPrintBar
              onExport={handleExport}
              onPrint={handlePrint}
              isExporting={isExporting}
              exportDisabled={filteredStock.length === 0}
              printDisabled={filteredStock.length === 0}
              exportLabel="Export Inventory"
              printLabel="Print Report"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStock.map((item) => {
                const status = getStockStatus(item.stockLevel);
                return (
                  <tr key={`${item.supplierId}-${item.productId}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{item.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplierSku}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${item.stockLevel === 0 ? 'text-red-600' :
                        item.stockLevel < 5 ? 'text-red-500' :
                          item.stockLevel < 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {item.stockLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badges variant={status.variant} size="sm">{status.label}</Badges>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="secondary" size="sm" onClick={() => openForm(item)}>
                        Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStock.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            className="mt-4"
          />
        )}
      </Card>

      {/* Hidden Printable Inventory Report */}
      <div style={{ display: 'none' }}>
        <PrintableInventoryReport
          ref={printRef}
          stock={filteredStock}
          totalItems={filteredStock.length}
          filters={filters}
        />
      </div>

      {formVisible && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 backdrop-brightness-40 bg-opacity-50" onClick={() => setFormVisible(false)}></div>

          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Update Stock Level</h2>
              <button onClick={() => setFormVisible(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.productName}</p>
                  <p className="text-xs text-gray-500 mt-1">SKU: {selectedProduct.supplierSku}</p>
                </div>
              </div>

              <div>
                <label htmlFor="stockLevel" className="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
                <input
                  type="number"
                  id="stockLevel"
                  min="0"
                  value={formData.stockLevel}
                  onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setFormVisible(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryTable;
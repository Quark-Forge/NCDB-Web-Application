import React, { useState, useEffect } from "react";
import Card from "../../common/Card";
import { useUpdateSupplierItemMutation } from "../../../slices/supplierItemsApiSlice";

const InventoryTable = ({ stock, filters, pagination, setPagination }) => {
  const [form, setForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ stockLevel: 0 });
  const [updateSupplierItem, { isLoading }] = useUpdateSupplierItemMutation();

  // ✅ Apply frontend filters
  const filteredStock = (stock || []).filter((item) => {
    const search = filters.searchTerm?.toLowerCase() || "";
    const nameMatch = item.productName.toLowerCase().includes(search);

    const inStock = !filters.inStock || item.stockLevel >= 10;
    const lowStock = !filters.lowStock || (item.stockLevel > 0 && item.stockLevel < 10);
    const outOfStock = !filters.outOfStock || item.stockLevel === 0;
    const criticalStock = !filters.criticalStock || (item.stockLevel > 0 && item.stockLevel < 5);

    return nameMatch && inStock && lowStock && outOfStock && criticalStock;
  });

  // ✅ Compute total pages
  const totalPages = Math.ceil(filteredStock.length / pagination.limit) || 1;

  // ✅ Reset page if it’s out of range after filtering
  useEffect(() => {
    if (pagination.page > totalPages) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [totalPages, pagination.page, setPagination]);

  // ✅ Paginate after filtering
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedStock = filteredStock.slice(startIndex, endIndex);

  const openForm = (product) => {
    setSelectedProduct(product);
    setFormData({ stockLevel: product.stockLevel });
    setForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateSupplierItem({
        supplier_id: selectedProduct.supplierId,
        product_id: selectedProduct.productId,
        stock_level: Number(formData.stockLevel),
      }).unwrap();

      alert("Product updated successfully!");
      setForm(false);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed!");
    }
  };

  return (
    <Card className="p-4 mt-4 overflow-x-auto">
      {filteredStock.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No matching products found
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <span>
              Showing {startIndex + 1} - {Math.min(endIndex, filteredStock.length)} of {filteredStock.length} items
            </span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Supplier</th>
                <th className="p-2">Product</th>
                <th className="p-2">Stock Level</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStock.map((item) => (
                <tr
                  key={item.productId}
                  className={`border-b ${item.stockLevel < 10 ? "bg-red-100" : "bg-white"}`}
                >
                  <td className="p-2">{item.supplierSku}</td>
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2 font-bold">{item.stockLevel}</td>
                  <td
                    className="p-2 font-bold cursor-pointer text-blue-600 hover:underline"
                    onClick={() => openForm(item)}
                  >
                    Update
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Frontend Pagination Buttons */}
          
        </>
      )}

      

      {/* Update form modal */}
      {form && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setForm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Update Product
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product ID</label>
                <input type="text" value={selectedProduct?.productId} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                <input type="text" value={selectedProduct?.productName} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stock Level</label>
                <input
                  type="number"
                  value={formData.stockLevel}
                  onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={isLoading} className={`px-4 py-2 rounded-lg text-white transition ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {isLoading ? "Updating..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default InventoryTable;

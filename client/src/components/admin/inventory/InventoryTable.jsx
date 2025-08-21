import React, { useState } from "react";
import Card from "../../common/Card";
import { useUpdateSupplierItemMutation } from "../../../slices/supplierItemsApiSlice";

const InventoryTable = ({ stock, filters }) => {
  const [form, setForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ stockLevel: 0 });
  const [updateSupplierItem, { isLoading }] = useUpdateSupplierItemMutation(); // get isLoading from mutation



  console.log(stock)
  
  if (!stock || stock.length === 0) {
    return <Card className="p-4">No products available</Card>;
  }

  const openForm = (product) => {
    setSelectedProduct(product);
    setFormData({ stockLevel: product.stockLevel }); // initialize formData
    setForm(true);
  };

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(filters.searchTerm.toLowerCase());

    let matchesStock = true;
    if (filters.inStock) matchesStock = item.stockLevel >= 10;
    if (filters.lowStock) matchesStock = item.stockLevel > 0 && item.stockLevel < 10;
    if (filters.outOfStock) matchesStock = item.stockLevel === 0;
    if (filters.criticalStock) matchesStock = item.stockLevel > 0 && item.stockLevel < 5;

    return matchesSearch && matchesStock;
  });

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedProduct) return;

  console.log("Updating product:", selectedProduct); // 👈 debug

  try {
    await updateSupplierItem({
      supplier_id: selectedProduct.supplierId, // adjust name
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
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Supplier</th>
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Stock Level</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStock.map((item) => (
            <tr
              key={item.productId}
              className={`border-b ${item.stockLevel < 10 ? "bg-red-100" : "bg-white"}`}
            >
              <td className="p-2">{item.supplierSku}</td>
              <td className="p-2">{item.productName}</td>
              <td className="p-2 font-bold">{item.stockLevel}</td>
              <td className="p-2 font-bold cursor-pointer" onClick={() => openForm(item)}>
                Update
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {form && selectedProduct && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Dark background overlay */}
    <div 
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={() => setForm(false)} // close when clicking outside
    ></div>

    {/* Form container */}
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
        Update Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
        {/* Product ID */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Product ID
          </label>
          <input
            type="text"
            value={selectedProduct?.productId}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed focus:outline-none"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={selectedProduct?.productName}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed focus:outline-none"
          />
        </div>

        {/* Stock Level */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Stock Level
          </label>
          <input
            type="number"
            value={formData.stockLevel}
            onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setForm(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white transition 
              ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
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

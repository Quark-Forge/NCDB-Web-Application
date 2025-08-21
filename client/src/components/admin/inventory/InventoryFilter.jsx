import React from "react";

const InventoryFilter = ({ filters, setFilters }) => {

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4 flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <input
        type="text"
        name="searchTerm"
        value={filters.searchTerm}
        onChange={handleChange}
        placeholder="Search by product name..."
        className="border p-2 rounded flex-1"
      />

      {/* Category
      <input
        type="text"
        name="supplier_Name"
        value={filters.supplier_Name}
        onChange={handleChange}
        placeholder="Supplier Name"
        className="border p-2 rounded flex-1"
      /> */}

      {/* Stock Filters */}
      <div className="flex gap-2 flex-wrap">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            name="inStock"
            checked={filters.inStock}
            onChange={handleChange}
          />
          In Stock
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            name="lowStock"
            checked={filters.lowStock}
            onChange={handleChange}
          />
          Low Stock
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            name="outOfStock"
            checked={filters.outOfStock}
            onChange={handleChange}
          />
          Out of Stock
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            name="criticalStock"
            checked={filters.criticalStock}
            onChange={handleChange}
          />
          Critical Stock
        </label>
      </div>
    </div>
  );
};

export default InventoryFilter;

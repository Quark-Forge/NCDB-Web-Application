import Button from "../../common/Button";

const InventoryFilter = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      inStock: false,
      lowStock: false,
      outOfStock: false,
      criticalStock: false,
    });
  };

  const hasActiveFilters = filters.searchTerm ||
    filters.inStock ||
    filters.lowStock ||
    filters.outOfStock ||
    filters.criticalStock;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 w-full">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleChange}
                placeholder="Search by product name..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="w-full md:w-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Stock Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Stock Status
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'inStock', label: 'In Stock' },
              { id: 'lowStock', label: 'Low Stock' },
              { id: 'outOfStock', label: 'Out of Stock' },
              { id: 'criticalStock', label: 'Critical Stock' }
            ].map((filter) => (
              <label key={filter.id} className="relative flex items-center cursor-pointer">
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name={filter.id}
                      checked={filters[filter.id]}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-7 rounded-full ${filters[filter.id] ? 'bg-blue-500' : 'bg-gray-300'} transition-colors`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${filters[filter.id] ? 'transform translate-x-7' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-sm font-medium text-gray-700">{filter.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilter;
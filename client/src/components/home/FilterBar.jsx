import { ChevronDownIcon, CircleAlert, SlidersHorizontal } from "lucide-react";
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";
import { useState } from "react";

const FilterBar = ({ category, sort, setCategory, setSort, priceRange, setPriceRange }) => {
    const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetCategoriesQuery();
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const categories = categoryData?.data || [];

    // Define sort options clearly
    const sortOptions = [
        { value: 'created_at_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A to Z' },
        { value: 'name_desc', label: 'Name: Z to A' },
        { value: 'rating_desc', label: 'Highest Rated' },
    ];

    const handlePriceApply = () => {
        setPriceRange(localPriceRange);
    };

    const handlePriceReset = () => {
        setLocalPriceRange([0, 1000]);
        setPriceRange([0, 1000]);
    };

    const selectedSortLabel = sortOptions.find(option => option.value === sort)?.label || 'Select sort option';

    return (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-gray-800">
                <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                Filters
            </h3>

            {/* Price Range Filter */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>LKR {localPriceRange[0]}</span>
                        <span>LKR {localPriceRange[1]}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={localPriceRange[0]}
                        onChange={(e) => setLocalPriceRange([parseInt(e.target.value), localPriceRange[1]])}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={localPriceRange[1]}
                        onChange={(e) => setLocalPriceRange([localPriceRange[0], parseInt(e.target.value)])}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={handlePriceApply}
                            className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handlePriceReset}
                            className="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                {categoryLoading ? (
                    <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                ) : categoryError ? (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                        <CircleAlert className="h-4 w-4" />
                        Failed to load categories
                    </p>
                ) : (
                    <div className="space-y-2">
                        <div
                            className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${category === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setCategory('')}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${category === '' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                {category === '' && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm">All Categories</span>
                        </div>
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${category === cat.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setCategory(cat.name)}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${category === cat.name ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                    {category === cat.name && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modern Dropdown Sorting */}
            <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-sm font-medium">{selectedSortLabel}</span>
                        <ChevronDownIcon
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            <div className="py-1">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSort(option.value);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${sort === option.value
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
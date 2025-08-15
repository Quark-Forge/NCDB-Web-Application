import { ChevronDownIcon, CircleAlert } from "lucide-react";
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";

const FilterBar = ({ category, sort, setCategory, setSort }) => {
    const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetCategoriesQuery();

    const categories = categoryData?.data || [];

    // Define sort options clearly
    const sortOptions = [
        { value: 'created_at_desc', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A to Z' },
        { value: 'name_desc', label: 'Name: Z to A' },
    ];

    return (
        <div className="mb-8">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                {categoryLoading ? (
                    <div className="animate-pulse">
                        <div className="h-10 w-48 rounded-lg bg-gray-200"></div>
                    </div>
                ) : categoryError ? (
                    <p className="text-red-500 flex items-center gap-2">
                        <CircleAlert className="h-5 w-5" />
                        Failed to load categories
                    </p>
                ) : (
                    <div className="relative">
                        <select
                            className="px-4 py-2.5 pr-10 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer w-48"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                )}

                {/* Sorting */}
                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                        }}
                        className="px-4 py-2.5 pr-10 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none cursor-pointer w-48"
                    >
                        {sortOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                className="bg-slate-50"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
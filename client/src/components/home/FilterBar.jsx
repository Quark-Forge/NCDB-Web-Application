import { ChevronDownIcon } from "lucide-react";
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";

const FilterBar = ({ category, sort, setCategory, setSort }) => {

    // Fetch categories
    const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetCategoriesQuery();

    const categories = categoryData?.data || [];

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
                {/* Category Filter */}
                {categoryLoading ? (
                    <div className="animate-pulse">
                        <div className="h-10 w-48 rounded-lg bg-gray-200"></div>
                    </div>
                ) : categoryError ? (
                    <p className="text-red-500 flex items-center gap-2">
                        <ExclamationCircleIcon className="h-5 w-5" />
                        Failed to load categories
                    </p>
                ) : (
                    <div className="relative">
                        <select
                            className="px-4 py-2.5 pr-10 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none cursor-pointer w-40"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                )}

                {/* Sorting */}
                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-2.5 pr-10 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none cursor-pointer w-40"
                    >
                        <option className="bg-slate-50" value="created_at_desc">Newest First</option>
                        <option className="bg-slate-50" value="price_asc">Price: Low to High</option>
                        <option className="bg-slate-50" value="price_desc">Price: High to Low</option>
                        <option className="bg-slate-50" value="name_asc">Name: A to Z</option>
                        <option className="bg-slate-50" value="name_desc">Name: Z to A</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterBar;
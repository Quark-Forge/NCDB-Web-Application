import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";
import { CircleAlert } from "lucide-react";

const CategoryTabs = ({ category, setCategory, setCurrentPage }) => {
  const { data: categoryData, isLoading, error } = useGetCategoriesQuery();
  const categories = categoryData?.data || [];

  const handleCategoryClick = (catName) => {
    setCategory(catName);
    setCurrentPage(1); // Reset to first page when category changes
  };

  if (isLoading) {
    return (
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-8 rounded-full px-4 py-2 min-w-[100px]"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 text-red-500 flex items-center gap-2">
        <CircleAlert className="h-5 w-5" />
        Failed to load categories
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
      <button
        onClick={() => handleCategoryClick('')}
        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === ''
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
        All Products
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.name)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.name
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
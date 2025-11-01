import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductWithSuppliers from '../../components/home/ProductWithSuppliers';
import { useGetProductsQuery } from '../../slices/ProductsApiSlice';
import { ChevronLeft, ChevronRight, CircleAlert, Filter, X } from 'lucide-react';
import FilterBar from '../../components/home/FilterBar';
import CategoryTabs from '../../components/home/CategoryTabs';

const Home = () => {
  // Get state and functions from layout context
  const { cartCount, setCartCount, cartItems, setCartItems, search, setSearch } = useOutletContext();

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('created_at_desc');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products with pagination
  const { data, isLoading, error } = useGetProductsQuery({
    search,
    category,
    sort,
    page: currentPage,
    limit: productsPerPage,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  });

  // Updated to match the new response structure
  const products = data?.data || [];
  const pagination = data?.pagination || {};
  const totalCount = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;
  const currentPageFromApi = pagination.page || 1;

  // Sync current page with API response
  useEffect(() => {
    if (currentPageFromApi !== currentPage) {
      setCurrentPage(currentPageFromApi);
    }
  }, [currentPageFromApi, currentPage]);

  useEffect(() => {
    // Your cart items effect
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartCount(prev => prev + 1);
    setCartItems(prev => [...prev, product]);
    console.log('Added to cart:', product);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (error) {
    return (
      <div className="mb-6 text-red-500 flex items-center p-10 gap-2">
        <CircleAlert className="h-5 w-5" />
        Failed to load Products
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our native products</p>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showMobileFilters && <X className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filter sidebar for desktop */}
          <div className={`hidden lg:block w-64 flex-shrink-0 ${showMobileFilters ? 'lg:block' : 'lg:block'}`}>
            <FilterBar
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSort}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          {/* Mobile filter overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
              <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterBar
                  category={category}
                  setCategory={setCategory}
                  sort={sort}
                  setSort={setSort}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>
            </div>
          )}

          {/* Products and pagination */}
          <div className="flex-1">
            {/* Category Tabs */}
            <CategoryTabs
              category={category}
              setCategory={setCategory}
              setCurrentPage={setCurrentPage}
            />

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-red-500 flex items-center gap-2">
                <CircleAlert className="h-5 w-5" />
                Failed to load products
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductWithSuppliers
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-1 py-1 rounded-3xl font-semibold transition-colors duration-200 ${currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-600'
                        }`}
                    >
                      <ChevronLeft />
                    </button>

                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`px-3 py-1 rounded-3xl font-semibold transition-colors duration-200 ${currentPage === number
                          ? 'text-white bg-blue-600'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-1 py-1 rounded-3xl font-semibold transition-colors duration-200 ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-600'
                        }`}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">NCDB</h3>
          <p className="text-gray-400">Your trusted e-commerce partner</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductWithSuppliers from '../../components/home/ProductWithSuppliers';
import { useGetProductsQuery } from '../../slices/ProductsApiSlice';
import { ChevronLeft, ChevronRight, CircleAlert, Filter, X, Search, Grid3X3, List } from 'lucide-react';
import FilterBar from '../../components/home/FilterBar';
import CategoryTabs from '../../components/home/CategoryTabs';

const Home = () => {
  // Get only cart-related states from layout context
  const { cartCount, setCartCount, cartItems, setCartItems } = useOutletContext();

  // Manage search state locally in Home component
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('created_at_desc');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Fetch products with pagination
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    search, // Use local search state
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

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort, priceRange]);

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

  // Generate page numbers for pagination with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = maxVisiblePages;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxVisiblePages + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      pages.unshift(1);
      if (startPage > 2) pages.splice(1, 0, '...');
    }
    if (endPage < totalPages) {
      pages.push(totalPages);
      if (endPage < totalPages - 1) pages.splice(pages.length - 1, 0, '...');
    }

    return pages;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setShowSearchBar(false);
    // The API call will automatically refetch due to the search state change
  };

  const handleClearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (catName) => {
    setCategory(catName);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  return (
    <>
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Discover Amazing Products
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find the best native products from trusted suppliers. Quality guaranteed with competitive prices.
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="flex-1 flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-500 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">
                {search ? `Search: ${search}` : 'Search products...'}
              </span>
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-3 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {showSearchBar && (
            <form onSubmit={handleSearchSubmit} className="mt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-16 top-2 px-2 py-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:block mb-6">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, category, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-24 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
              />
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-20 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Filter sidebar for desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterBar
              category={category}
              setCategory={handleCategoryChange}
              sort={sort}
              setSort={handleSortChange}
              priceRange={priceRange}
              setPriceRange={handlePriceRangeChange}
            />
          </div>

          {/* Mobile filter overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowMobileFilters(false)}
              ></div>
              <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Filters & Sort</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterBar
                  category={category}
                  setCategory={handleCategoryChange}
                  sort={sort}
                  setSort={handleSortChange}
                  priceRange={priceRange}
                  setPriceRange={handlePriceRangeChange}
                />
              </div>
            </div>
          )}

          {/* Products and pagination */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {search ? `Search Results for "${search}"` : 'Featured Products'}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {totalCount} {totalCount === 1 ? 'product' : 'products'}
                </span>
                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear search
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <CategoryTabs
              category={category}
              setCategory={handleCategoryChange}
              setCurrentPage={setCurrentPage}
            />

            {/* Products */}
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {[...Array(productsPerPage)].map((_, i) => (
                  <div key={i} className={`animate-pulse ${viewMode === 'list' ? 'flex gap-4' : ''
                    }`}>
                    <div className={`bg-gray-200 rounded-lg ${viewMode === 'list' ? 'w-32 h-32' : 'h-48'
                      }`}></div>
                    <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-2'}`}>
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <CircleAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to load products</h3>
                <p className="text-gray-600 mb-4">Please check your connection and try again</p>
                <button
                  onClick={refetch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {search ? 'No products found' : 'No products available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {search ? 'Try adjusting your search terms or filters' : 'Check back later for new products'}
                </p>
                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`gap-6 ${viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col'
                  }`}>
                  {products.map((product) => (
                    <ProductWithSuppliers
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * productsPerPage + 1} to {Math.min(currentPage * productsPerPage, totalCount)} of {totalCount} products
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors ${currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {generatePageNumbers().map((number, index) => (
                        <button
                          key={index}
                          onClick={() => typeof number === 'number' ? handlePageChange(number) : null}
                          disabled={number === '...'}
                          className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${number === currentPage
                            ? 'bg-blue-600 text-white'
                            : number === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">NCDB Mart</h3>
              <p className="text-gray-400">Your trusted e-commerce partner for quality products.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
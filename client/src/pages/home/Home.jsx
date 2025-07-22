import React, { useState } from 'react';
import Navbar from '../../components/home/Navbar';
import ProductCard from '../../components/home/ProductCard';
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../../slices/categoryApiSlice';

const Home = () => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('created_at_desc');

  // Fetch products with pagination
  const { data, isLoading, error } = useGetProductsQuery({
    search,
    category,
    sort,
    page: currentPage,
    limit: productsPerPage,
  });

  // Fetch categories
  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetCategoriesQuery();

  const products = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / productsPerPage);

  const categories = categoryData?.data || [];

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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar cartCount={cartCount} search={search} setSearch={setSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our latest collection of premium products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {categoryLoading ? (
            <p>Loading categories...</p>
          ) : categoryError ? (
            <p className="text-red-500">Failed to load categories</p>
          ) : (
            <select
              className="px-4 py-2 rounded-md border bg-slate-50 border-gray-300"
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
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 rounded-md border bg-slate-50 border-gray-300"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Products */}
        {isLoading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load products</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-3xl font-semibold transition-colors duration-200 ${currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                Previous
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-4 py-2 rounded-3xl font-semibold transition-colors duration-200 ${currentPage === number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                    }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-3xl font-semibold transition-colors duration-200 ${currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">NCDB</h3>
          <p className="text-gray-400">Your trusted e-commerce partner</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

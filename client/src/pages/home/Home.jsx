import React, { useState } from 'react';
import { mockProducts } from "../../data/products";
import Navbar from '../../components/home/Navbar';
import ProductCard from '../../components/home/ProductCard';
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../../slices/categoryApiSlice';


const Home = () => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('price_asc');


  const { data, isLoading, error } = useGetProductsQuery({
    search,
    category,
    sort,
    page: currentPage,
    limit: productsPerPage,
  });
  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetCategoriesQuery();

  const products = data?.data || [];
  const categories = categoryData?.data || [];


  // test
  console.log("API response:", data);
  console.log("Categories response", categoryData);



  const handleAddToCart = (product) => {
    setCartCount(prevCount => prevCount + 1);
    setCartItems(prevItems => [...prevItems, product]);
    console.log('Added to cart:', product);
  };

  // Calculate pagination details
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);


  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <Navbar
        cartCount={cartCount}
        search={search}
        setSearch={setSearch}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our latest collection of premium products</p>
        </div>

        <div>
          {/* Categories to filter option */}
          {
            categoryLoading ? (
              <p>Loading categories...</p>
            ) : categoryError ? (
              <p className="text-red-500">Failed to load Categorise</p>
            ) : (
              <select
                className="mb-6 px-4 py-2 dropdown-content menu rounded-md border border-gray-300"
                name="categories"
                id="categories"
                onChange={(e) => setCategory(e.target.value)}
              >
                {
                  categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))
                }
              </select>
            )
          }
          {/* Sorting */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="ml-4 mb-6 px-4 py-2 rounded-md border border-gray-300"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
        


        {/* Handle loading & error states */}
        {isLoading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load products</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">NCDB</h3>
            <p className="text-gray-400">Your trusted e-commerce partner</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
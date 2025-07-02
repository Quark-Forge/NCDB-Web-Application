import { useState } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';
import UserProfile from './UserProfile';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cartCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  return (
    <>
      <div className='flex flex-col w-full space-y-4'>
        <nav className="bg-white w-full flex flex-row justify-between space-x-5 px-5 py-3 shadow-md border-b-2 border-blue-100 sticky top-0 z-50">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              NCDB Mart
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:block max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full md:w-3xl pl-10 pr-3 py-2 border border-gray-300 rounded-2xl md:rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex flex-row items-center space-x-3">
            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-3xl hover:bg-blue-50"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            {/* User Profile */}
            {
              userInfo ? (
                <button
                  onClick={handleProfileClick}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <User className="h-5 w-5 text-white" />
                  </div> */}
                  <img
                    src="../../images/user.png"
                    alt="User Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </button>
              ) : (
                // login / register button 
                <div className='flex flex-row space-x-1'>
                  <button
                    className="w-full bg-blue-500 px-5 py-2 hover:bg-blue-600 text-white rounded-3xl transition duration-200"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button
                    className="w-full border-1 border-blue-500 px-5 py-2 hover:bg-blue-500 hover:text-white text-blue-500 rounded-3xl transition duration-200"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </button>
                </div>
              )
            }
          </div>
        </nav> 
        {/* Search Bar for mobile view */}
        <div className="md:hidden w-full px-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full md:w-3xl pl-10 pr-3 py-2 border border-gray-300 rounded-2xl md:rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </form>
        </div>

      </div>


      {/* User Profile Popup */}
      <UserProfile isOpen={isProfileOpen} onClose={handleProfileClose} />
    </>
  );
};

export default Navbar;
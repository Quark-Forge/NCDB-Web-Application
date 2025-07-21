import { useState } from 'react';
import { Search, ShoppingCartIcon } from 'lucide-react';
import UserProfile from '../user/UserProfile';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cartCount = 0, search, setSearch }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', search);
    set
    
  };

  const handleCartClick = () => {
    navigate('/user/cart');
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav className="bg-white w-full px-4 py-3 shadow-md border-blue-100 sticky top-0 z-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0 w-full md:w-auto justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              NCDB Mart
            </button>

            {/* Mobile: Auth Buttons + Cart */}
            <div className="flex items-center space-x-3 md:hidden">
              {!userInfo ? (
                <>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCartClick}
                      className="relative cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                    >
                      <ShoppingCartIcon className="h-6 w-6" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </button>
                    <button
                      className="bg-blue-500 px-3 py-1 text-white rounded-3xl hover:bg-blue-600 transition text-sm"
                      onClick={() => navigate('/auth/login')}
                    >
                      Login
                    </button>
                    <button
                      className="border border-blue-500 px-3 py-1 text-blue-500 rounded-3xl hover:bg-blue-500 hover:text-white transition text-sm"
                      onClick={() => navigate('/auth/register')}
                    >
                      Register
                    </button>
                  </div>

                </>
              ) : (
                <>
                  <button
                    onClick={handleCartClick}
                    className="relative cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleProfileClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src="../../images/user.png"
                      alt="User Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Middle: Search Bar */}
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border-0 bg-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 right-3 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
            </form>
          </div>

          {/* Right: Cart + Profile/Login/Register (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Profile or Login/Register */}
            {userInfo ? (
              <button
                onClick={handleProfileClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src="../../images/user.png"
                  alt="User Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  className="bg-blue-500 px-4 py-2 text-white rounded-3xl hover:bg-blue-600 transition"
                  onClick={() => navigate('/auth/login')}
                >
                  Login
                </button>
                <button
                  className="border border-blue-500 px-4 py-2 text-blue-500 rounded-3xl hover:bg-blue-500 hover:text-white transition"
                  onClick={() => navigate('/auth/register')}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile Popup */}
      {isProfileOpen && (
        <UserProfile isOpen={true} onClose={handleProfileClose} />
      )}
    </>
  );
};

export default Navbar;
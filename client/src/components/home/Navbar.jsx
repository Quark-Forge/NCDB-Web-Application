import { useState, useCallback, memo } from 'react';
import { Search, LayoutDashboard, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminProfile from '../../pages/admin/AdminProfile';
import UserProfile from '../user/UserProfile';

// Constants
const ALLOWED_ROLES = ['Admin', 'Order Manager', 'Inventory Manager'];
const DEFAULT_USER_IMAGE = '../../images/user.png';

// Memoized components to prevent unnecessary re-renders
const CartButton = memo(({ cartCount, onClick }) => (
  <button
    onClick={onClick}
    className="relative cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
    aria-label={`Shopping cart with ${cartCount} items`}
  >
    <ShoppingBag className="h-6 w-6" />
    {cartCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
        {cartCount > 99 ? '99+' : cartCount}
      </span>
    )}
  </button>
));

const AdminButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1 md:px-3 md:py-2 rounded-3xl hover:bg-gray-600 transition text-sm md:text-base"
    aria-label="Admin dashboard"
  >
    <LayoutDashboard className="h-4 w-4" />
    <span>Admin</span>
  </button>
));

const AuthButtons = memo(({ navigate }) => (
  <div className="flex space-x-2 md:space-x-3">
    <button
      className="bg-blue-500 px-3 py-1 md:px-4 md:py-2 text-white rounded-3xl hover:bg-blue-600 transition text-sm md:text-base"
      onClick={() => navigate('/auth/login')}
    >
      Sign in
    </button>
    <button
      className="border border-blue-500 px-3 py-1 md:px-4 md:py-2 text-blue-500 rounded-3xl hover:bg-blue-500 hover:text-white transition text-sm md:text-base"
      onClick={() => navigate('/auth/register')}
    >
      Sign up
    </button>
  </div>
));

const ProfileButton = memo(({ onClick, userInfo }) => (
  <button
    onClick={onClick}
    className="cursor-pointer hover:opacity-80 transition-opacity"
    aria-label="User profile"
  >
    {userInfo?.profile_picture ? (
      <img
        src={userInfo.profile_picture}
        alt="User Profile"
        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
      />
    ) : (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center">
        <UserIcon className="h-5 w-5 text-gray-500" />
      </div>
    )}
  </button>
));

const Navbar = ({ cartCount = 0, search, setSearch }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleCartClick = () => {
    // setIsCardOpen(true);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/user/cart');
  }, [navigate]);

  const handleAdminPanelClick = useCallback(() => {
    navigate('/admin/dashboard');
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    setIsProfileOpen(true);
  }, []);

  const handleProfileClose = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const isAdmin = userInfo && ALLOWED_ROLES.includes(userInfo.user_role);

  return (
    <>
      <nav className="bg-white w-full px-4 md:px-8 py-3 shadow-md border-b border-blue-100 sticky top-0 z-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mx-auto max-w-7xl">
          {/* Logo and Mobile Controls */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              onClick={() => navigate('/')}
              className="text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              aria-label="Home"
            >
              NCDB Mart
            </button>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-3 md:hidden">
              {!userInfo ? (
                <>
                  <CartButton cartCount={cartCount} onClick={handleCartClick} />
                  <AuthButtons navigate={navigate} />
                </>
              ) : (
                <>
                  {isAdmin && <AdminButton onClick={handleAdminPanelClick} />}
                  <CartButton cartCount={cartCount} onClick={handleCartClick} />
                  <ProfileButton onClick={handleProfileClick} userInfo={userInfo} />
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-1/2 lg:w-2/5 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-0 bg-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
              aria-label="Search products"
            />
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {userInfo ? (
              <>
                {isAdmin && <AdminButton onClick={handleAdminPanelClick} />}
                <CartButton cartCount={cartCount} onClick={handleCartClick} />
                <ProfileButton onClick={handleProfileClick} userInfo={userInfo} />
              </>
            ) : (
              <>
                <CartButton cartCount={cartCount} onClick={handleCartClick} />
                <AuthButtons navigate={navigate} />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {isProfileOpen && (
        isAdmin ? (
          <AdminProfile onClose={handleProfileClose} />
        ) : (
          <UserProfile isOpen={true} onClose={handleProfileClose} />
        )
      )}
    </>
  );
};

export default memo(Navbar);
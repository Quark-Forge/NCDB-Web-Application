import { useState, useCallback, memo, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Menu, X, Home, Info, Phone, HelpCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetCartQuery } from '../../slices/cartApiSlice';
import ProfileDropdown from '../user/ProfileDropdown ';

// Constants
const ALLOWED_ROLES = ['Admin', 'Order Manager', 'Inventory Manager', 'Supplier'];

// Memoized components
const CartButton = memo(({ cartCount, onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="relative cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={`Shopping cart with ${cartCount} items`}
  >
    <ShoppingBag className="h-6 w-6" />
    {cartCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
        {cartCount > 99 ? '99+' : cartCount}
      </span>
    )}
    {isLoading && (
      <div className="absolute inset-0 bg-white bg-opacity-50 rounded-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    )}
  </button>
));

const AdminButton = memo(({ onClick, userRole }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full justify-center"
  >
    <LayoutDashboard className="h-4 w-4" />
    <span>{userRole === 'Supplier' ? 'Supplier' : 'Admin'}</span>
  </button>
));

const MobileMenuButton = memo(({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
    aria-label={isOpen ? "Close menu" : "Open menu"}
  >
    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
  </button>
));

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading: cartLoading } = useGetCartQuery(undefined, {
    skip: !(userInfo && userInfo.user_role === 'Customer'),
    refetchOnMountOrArgChange: true,
  });

  const cartCount = data?.data?.CartItems?.length || 0;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleCartClick = useCallback(() => {
    if (userInfo?.user_role === 'Customer') {
      navigate('/user/cart');
    } else if (!userInfo) {
      navigate('/auth/login');
    }
  }, [navigate, userInfo]);

  const handleAdminPanelClick = useCallback(() => {
    if (userInfo?.user_role === 'Supplier') {
      navigate('/suppliers/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  }, [navigate, userInfo]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const isAdmin = userInfo && ALLOWED_ROLES.includes(userInfo.user_role);

  return (
    <>
      <nav className="w-full px-4 lg:px-8 py-3 shadow-lg border-b border-gray-100 sticky top-0 z-50 bg-white">
        <div className="flex items-center justify-between gap-4 mx-auto max-w-7xl">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 text-xl lg:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              NCDB Mart
            </button>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            {userInfo ? (
              <>
                {isAdmin && (
                  <button
                    onClick={handleAdminPanelClick}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{userInfo.user_role === 'Supplier' ? 'Supplier' : 'Admin'}</span>
                  </button>
                )}
                {userInfo.user_role === 'Customer' && (
                  <CartButton
                    cartCount={cartCount}
                    onClick={handleCartClick}
                    isLoading={cartLoading}
                  />
                )}
                <ProfileDropdown />
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/auth/login')}
                  className="bg-blue-600 px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="border border-blue-600 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Cart Button */}
          {!isMobileMenuOpen && userInfo?.user_role === 'Customer' && (
            <div className="md:hidden">
              <CartButton
                cartCount={cartCount}
                onClick={handleCartClick}
                isLoading={cartLoading}
              />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={closeMobileMenu}
            />

            {/* Menu Panel */}
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-semibold text-gray-900">Menu</span>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* User Info */}
                {userInfo && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={userInfo?.image_url || "/images/user.png"}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/user.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {userInfo.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-4 flex-1">
                  <button
                    onClick={() => {
                      navigate('/');
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </button>

                  {userInfo ? (
                    <>
                      {isAdmin && (
                        <AdminButton
                          onClick={() => {
                            handleAdminPanelClick();
                            closeMobileMenu();
                          }}
                          userRole={userInfo.user_role}
                        />
                      )}
                      <ProfileDropdown onItemClick={closeMobileMenu} />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          navigate('/auth/login');
                          closeMobileMenu();
                        }}
                        className="w-full bg-blue-600 px-4 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => {
                          navigate('/auth/register');
                          closeMobileMenu();
                        }}
                        className="w-full border border-blue-600 px-4 py-3 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      >
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default memo(Navbar);
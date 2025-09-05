import { useState, useCallback, memo } from 'react';
import { Search, LayoutDashboard, ShoppingBag, User as UserIcon, Home } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetCartQuery } from '../../slices/cartApiSlice';
import ProfileDropdown from './ProfileDropdown ';

// Constants
const ALLOWED_ROLES = ['Customer'];
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

const HomeButton = memo(({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-1 md:px-3 md:py-2 rounded-3xl hover:bg-gray-100 transition text-sm md:text-base"
        aria-label="Go to home"
    >
        <Home className="h-4 w-4" />
        <span>Home</span>
    </button>
));

const UserNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useSelector((state) => state.auth);

    const { data, isLoading } = useGetCartQuery(undefined, {
        skip: !userInfo, // only fetch if logged in
    });

    // Count only number of distinct cart items
    const cartCount = data?.data?.CartItems?.length || 0;

    const handleCartClick = useCallback(() => {
        navigate('/user/cart');
    }, [navigate]);

    const handleHomeClick = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const isAdmin = userInfo && ALLOWED_ROLES.includes(userInfo.user_role);

    // Don't show search bar on user pages
    const showSearchBar = !location.pathname.includes('/user');

    return (
        <>
            <nav className="bg-white w-full px-4 md:px-8 py-3 shadow-md border-b border-blue-100 sticky top-0 z-50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mx-auto max-w-7xl">
                    {/* Logo and Mobile Controls */}
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <button
                            onClick={handleHomeClick}
                            className="text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            aria-label="Home"
                        >
                            NCDB Mart
                        </button>

                        {/* Mobile Controls */}
                        <div className="flex items-center space-x-3 md:hidden">
                            <HomeButton onClick={handleHomeClick} />
                            <CartButton cartCount={cartCount} onClick={handleCartClick} />
                            {/* Replace ProfileButton with ProfileDropdown */}
                            <ProfileDropdown />
                        </div>
                    </div>

                    {/* Search Bar - Only show on certain pages */}
                    {showSearchBar && (
                        <div className="w-full md:w-1/2 lg:w-2/5 relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="block w-full pl-10 pr-3 py-2 border-0 bg-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
                                aria-label="Search products"
                            />
                        </div>
                    )}

                    {/* Desktop Controls */}
                    <div className="hidden md:flex items-center space-x-4">
                        <HomeButton onClick={handleHomeClick} />
                        <CartButton cartCount={cartCount} onClick={handleCartClick} />
                        {/* Replace ProfileButton with ProfileDropdown */}
                        <ProfileDropdown />
                    </div>
                </div>
            </nav>
        </>
    );
};

export default memo(UserNavbar);
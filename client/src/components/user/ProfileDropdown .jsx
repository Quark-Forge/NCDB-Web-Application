import { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown, LogOut, User, Settings, Heart, Package, ShoppingBag } from 'lucide-react';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import { clearCredentials } from '../../slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfileDropdown = memo(({ onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      window.dispatchEvent(new Event('storage'));
      navigate('/auth/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Logout failed');
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleItemClick = (callback) => {
    setIsOpen(false);
    onItemClick?.();
    callback?.();
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      onClick: () => navigate('/user/profile'),
      show: true
    },
    {
      icon: Package,
      label: 'My Orders',
      onClick: () => navigate('/user/myorders'),
      show: true
    },
    {
      icon: Heart,
      label: 'Wishlist',
      onClick: () => navigate('/user/wishlist'),
      show: userInfo?.user_role === 'Customer'
    },
    {
      icon: ShoppingBag,
      label: 'My Cart',
      onClick: () => navigate('/user/cart'),
      show: userInfo?.user_role === 'Customer'
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
        aria-label="User profile menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={userInfo?.image_url || "/images/user.png"}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover shadow-sm"
          onError={(e) => {
            e.target.src = "/images/user.png";
          }}
        />
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 shadow-xl rounded-xl z-50 border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
          {/* User info section */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <img
                src={userInfo?.image_url || "/images/user.png"}
                alt="User Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  e.target.src = "/images/user.png";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">
                  {userInfo?.name || "Guest User"}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {userInfo?.email || "No email available"}
                </p>
                <p className="text-xs text-blue-600 font-medium capitalize mt-1">
                  {userInfo?.user_role || "Guest"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            {menuItems
              .filter(item => item.show)
              .map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item.onClick)}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  {item.label}
                </button>
              ))}
          </div>

          {/* Logout section */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => handleItemClick(logoutHandler)}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:animate-pulse" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProfileDropdown;
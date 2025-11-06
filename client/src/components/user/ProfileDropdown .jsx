import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User, Settings, Heart, Package } from 'lucide-react';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import { clearCredentials } from '../../slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
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
      // Dispatch storage event to sync across tabs
      window.dispatchEvent(new Event('storage'));
      navigate('/auth/login');
    } catch (err) {
      toast.error(err?.data?.message || 'Logout failed');
    }
  }

  // Handle hover events with delay for better UX
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms delay before closing
  };

  // Close dropdown when clicking outside
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
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
        aria-label="User profile menu"
      >
        <img
          src={userInfo?.image_url || "../../images/user.png"}
          alt="Avatar"
          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors"
          onError={(e) => {
            e.target.src = "../../images/user.png";
          }}
        />
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg z-50 border border-gray-200 overflow-hidden">
          {/* User info section */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <img
                src={userInfo?.profile_picture || "../../images/user.png"}
                alt="User Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  e.target.src = "../../images/user.png";
                }}
              />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {userInfo?.name || "Guest User"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {userInfo?.email || "No email available"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/user/profile');
              }}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4 mr-3 text-gray-400" />
              My Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/user/myorders');
              }}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Package className="w-4 h-4 mr-3 text-gray-400" />
              My Orders
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/user/wishlist');
              }}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Heart className="w-4 h-4 mr-3 text-gray-400" />
              Wishlist
            </button>
          </div>

          {/* Logout section */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <button
              onClick={logoutHandler}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
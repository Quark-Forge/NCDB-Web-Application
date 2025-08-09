import { useRef, useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Home,
  Users,
  ShoppingCart,
  Settings,
  ShoppingBag,
  Menu,
  X,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../../slices/authSlice';
import { toast } from 'react-toastify';

// Navigation configuration
const adminNavConfig = {
  mainItems: [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      allowedRoles: ['Admin', 'Order Manager', 'Inventory Manager'],
      icon: <Home size={18} />
    },
    {
      to: '/admin/users',
      label: 'Users',
      allowedRoles: ['Admin'],
      icon: <Users size={18} />
    },
    {
      to: '/admin/orders',
      label: 'Orders',
      allowedRoles: ['Admin', 'Order Manager'],
      icon: <ShoppingBag size={18} />
    },
  ],
  productItems: [
    {
      to: '/admin/products',
      label: 'Products',
      icon: <ShoppingCart size={16} />
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: <Tag size={16} />
    },
    {
      to: '/admin/suppliers',
      label: 'Suppliers',
      icon: <Users size={16} />
    },
  ]
};

// Custom hook for authorization
const useAdminAuth = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  const hasAccess = (allowedRoles) => {
    return allowedRoles ? allowedRoles.includes(userInfo?.user_role) : true;
  };

  return { userInfo, hasAccess };
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall, { isLoading }] = useLogoutMutation();
  const { userInfo, hasAccess } = useAdminAuth();

  useEffect(() => {
    // Auto-expand products menu if on a products-related page
    const productPaths = ['/admin/products', '/admin/categories', '/admin/suppliers'];
    if (productPaths.some(path => location.pathname.includes(path))) {
      setProductsExpanded(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/auth/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Logout failed');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter navigation items based on role
  const filteredNavItems = useMemo(() => (
    adminNavConfig.mainItems.filter(item => hasAccess(item.allowedRoles))
  ), [userInfo]);

  // Early return if unauthorized
  if (!userInfo) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navbar */}
      <header className="h-16 w-full bg-white shadow z-20 px-5 flex items-center justify-between fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-xl font-bold text-blue-600">{userInfo.user_role} Panel</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <img
              src="../../images/user.png"
              alt="User"
              className="w-9 h-9 rounded-full"
            />
            <span className="sr-only">User profile</span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
              role="menu"
            >
              <div className="py-1">
                <NavLink
                  to="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </NavLink>
                <NavLink
                  to="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main layout area */}
      <div className="flex mt-16 h-full">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-full w-64 bg-white shadow-md z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          aria-label="Sidebar"
        >
          <nav className="p-4 space-y-2">
            {filteredNavItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-md transition ${isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
                end
              >
                {icon} {label}
              </NavLink>
            ))}

            {/* Products Menu with Submenu */}
            <div className="space-y-1">
              <button
                onClick={() => setProductsExpanded(!productsExpanded)}
                className={`w-full flex items-center justify-between gap-2 p-2 rounded-md transition ${location.pathname.includes('/admin/products') ||
                    location.pathname.includes('/admin/categories') ||
                    location.pathname.includes('/admin/suppliers')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`}
                aria-expanded={productsExpanded}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Products
                </div>
                {productsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {productsExpanded && (
                <div className="ml-4 space-y-1" role="menu">
                  {adminNavConfig.productItems.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 p-2 rounded-md transition text-sm ${isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-200'
                        }`
                      }
                      role="menuitem"
                    >
                      {icon} {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <NavLink
              to="/admin/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-md transition ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-200'
                }`
              }
              end
            >
              <Settings size={18} /> Settings
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-2 bg-gray-100 overflow-y-auto md:h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
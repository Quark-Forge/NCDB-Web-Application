import { useRef, useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../../slices/authSlice';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    // Auto-expand products menu if we're on a products-related page
    if (location.pathname.includes('/admin/products') || location.pathname.includes('/admin/categories') || location.pathname.includes('/admin/suppliers')) {
      setProductsExpanded(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/auth/login');
    } catch (err) {
      console.log(err);
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

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  ];

  const productSubItems = [
    { to: '/admin/products', label: 'Products', icon: <ShoppingCart size={16} /> },
    { to: '/admin/categories', label: 'Categories', icon: <Tag size={16} /> },
    { to: '/admin/suppliers', label: 'Suppliers', icon: <Users size={16} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navbar */}
      <header className="h-16 w-full bg-white shadow z-20 px-5 flex items-center justify-between fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 focus:outline-none md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-xl font-bold text-blue-600">Admin Panel</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src="../../images/user.png"
              alt="User"
              className="w-9 h-9 rounded-full"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-100 rounded-md shadow-lg z-50">
              <div className="py-1 text-sm text-gray-700">
                <NavLink
                  to="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 hover:bg-gray-200"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </NavLink>
                <NavLink
                  to="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 hover:bg-gray-200"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
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
          className={`fixed md:static top-16 md:top-0 left-0 h-full w-64 bg-slate-100 shadow-md z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map(({ to, label, icon }) => (
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
              >
                {icon} {label}
              </NavLink>
            ))}

            {/* Products Menu with Submenu */}
            <div className="space-y-1">
              <button
                onClick={() => setProductsExpanded(!productsExpanded)}
                className={`w-full flex items-center justify-between gap-2 p-2 rounded-md transition ${location.pathname.includes('/admin/products') || location.pathname.includes('/admin/categories') || location.pathname.includes('/admin/suppliers')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Products
                </div>
                {productsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {productsExpanded && (
                <div className="ml-4 space-y-1">
                  {productSubItems.map(({ to, label, icon }) => (
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
                    >
                      {icon} {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Settings as the last item */}
            <NavLink
              to="/admin/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-md transition ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-200'
                }`
              }
            >
              <Settings size={18} /> Settings
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 bg-gray-100 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
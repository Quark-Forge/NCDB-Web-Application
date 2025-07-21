import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  ShoppingCart,
  Settings,
  ShoppingBag,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/admin/products', label: 'Products', icon: <ShoppingCart size={18} /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navbar */}
      <header className="w-full bg-white shadow z-20 p-4 flex items-center justify-between">
        {/* Mobile sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 focus:outline-none md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-xl font-bold text-blue-600">Admin Panel</span>
        </div>

        {/* Right side (Profile/Settings) */}
        <div className="flex items-center gap-4">
          {/* Example placeholder */}
          <UserCircle size={28} className="text-gray-700" />
        </div>
      </header>
      <div  className='flex h-screen'>
        {/* Mobile Sidebar */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow z-20 p-4 flex items-center justify-between">
          {/* <span className="text-xl font-bold text-blue-600">Admin Panel</span> */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`fixed top-16 md:top-0 left-0 z-30 h-full w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:static`}
        >
          {/* <div className="p-6 text-xl font-bold text-blue-600 border-b border-gray-200 hidden md:block">
            Admin Panel
          </div> */}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 mt-16 md:mt-0 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

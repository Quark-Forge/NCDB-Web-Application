import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Users from '../pages/admin/Users';
import Products from '../pages/admin/Products';
import Categories from '../pages/admin/Categories';
import Suppliers from '../pages/admin/Suppliers';
import Orders from '../pages/admin/orders/Orders';
import Dashboard from '../pages/admin/Dashboard';
import Settings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/AdminProfile';
import OrderDetails from '../pages/admin/orders/OrderDetails';
import Shipping from '../pages/admin/shipping/Shipping';
import Inventory  from '../pages/admin/Inventory';

export const adminChildren = (
  <>
    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
      <Route path='users' element={<Users />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Order Manager']} />}>
      <Route path='orders' element={<Orders />} />
      <Route path='orders/:orderId' element={<OrderDetails />} />
      <Route path='shipping' element={<Shipping />} />
    </Route>

    {/* Remove empty ProtectedRoute block */}

    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Order Manager', 'Inventory Manager']} />}>
      <Route path='products' element={<Products />} />
      <Route path='categories' element={<Categories />} />
      <Route path='suppliers' element={<Suppliers />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='settings' element={<Settings />} />
      <Route path='profile' element={<AdminProfile />} />
      <Route path='inventory' element={<Inventory />} />
    </Route>
  </>
);

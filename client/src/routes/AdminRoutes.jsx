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

export const adminChildren = (
  <>

    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
      <Route path='users' element={<Users />}></Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Order Manager']} />}>
      <Route path='orders' element={<Orders />}></Route>
      <Route path='orders/:orderId' element={<OrderDetails />}></Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Inventory Manager']} />}>
      
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Order Manager', 'Inventory Manager']} />}>
      <Route path='products' element={<Products />}></Route>
      <Route path='categories' element={<Categories />}></Route>
      <Route path='suppliers' element={<Suppliers />}></Route>
      <Route path='dashboard' element={<Dashboard />}></Route>
      <Route path='settings' element={<Settings />}></Route>
    <Route path='profile' element={<AdminProfile/>}></Route>
      <Route path='profile' element={<AdminProfile />}></Route>
    </Route>




  </>
);

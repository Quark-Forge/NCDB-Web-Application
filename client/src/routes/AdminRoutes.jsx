import { Route } from 'react-router-dom';
import Users from '../pages/admin/Users';
import Products from '../pages/admin/Products';
import Orders from '../pages/admin/Orders';
import Dashboard from '../pages/admin/Dashboard';
import Settings from '../pages/admin/Settings';

export const adminChildren = (
  <>
    <Route path='users' element={<Users/>}></Route>
    <Route path='products' element={<Products/>}></Route>
    <Route path='orders' element={<Orders/>}></Route>
    <Route path='dashboard' element={<Dashboard/>}></Route>
    <Route path='settings' element={<Settings/>}></Route>
  </>
);

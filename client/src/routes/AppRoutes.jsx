import { Route, Routes } from 'react-router-dom';
import { homeChildren } from './HomeRoutes';
import { adminChildren } from './AdminRoutes';
import { authChildren } from './AuthRoutes';
import { userChildren } from './UserRoutes';
import AuthLayout from '../components/layouts/AuthLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import UserLayout from '../components/layouts/UserLayout';
import HomeLayout from '../components/layouts/HomeLayout';
import ProtectedRoute from './ProtectedRoute';
import ErrorPage from '../pages/ErrorPage';
import Unauthorized from '../pages/Unauthorized';


const AppRoutes = () => {
  return (
    <>
      <Routes>

        <Route path='/' element={<HomeLayout />} >
          {homeChildren}
        </Route>

        <Route path='/auth/*' element={<AuthLayout />} >
          {authChildren}
        </Route>

        {/* Protected route only for admin */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Order Manager', 'Inventory Manager']} />}>
          <Route path='/admin/*' element={<AdminLayout />}>
            {adminChildren}
          </Route>
        </Route>

        {/* Protected route only for customer */}
        <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
          <Route path='/user/*' element={<UserLayout />}>
            {userChildren}
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<ErrorPage statusCode={404} message="Page not found!" />} />

      </Routes>
    </>
  )
}

export default AppRoutes;
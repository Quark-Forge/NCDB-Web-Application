import { Route, Routes } from 'react-router-dom';
import { homeChildren } from './HomeRoutes';
import { adminChildren } from './AdminRoutes';
import { authChildren } from './AuthRoutes';
import { userChildren } from './UserRoutes';
import AuthLayout from '../components/layouts/AuthLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import UserLayout from '../components/layouts/UserLayout';
import HomeLayout from '../components/layouts/HomeLayout';



const AppRoutes = () => {
  return (
    <>
    <Routes>

        <Route path='/*' element= {<HomeLayout/>} >
          {homeChildren}
        </Route>

        <Route path='/auth/*' element= {<AuthLayout/>} >
          {authChildren}
        </Route>

        <Route path='/admin/*' element= {<AdminLayout/>}>
          {adminChildren}
        </Route>

        <Route path='/user/*' element= {<UserLayout/>}>
          {userChildren}
        </Route>
        
    </Routes> 
    </>
  )
}

export default AppRoutes;
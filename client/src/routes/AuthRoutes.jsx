import { Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Vrification from '../pages/auth/Vrification';
import ResendVerification from '../pages/auth/ResendVerification';
import Verified from '../pages/auth/Verified';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Unauthorized from '../pages/Unauthorized';

export const authChildren = (

    <>
        <Route index element={<Login />} />
        <Route path='login' index={true} element={<Login />}></Route>
        <Route path='register' element={<Register />}></Route>
        <Route path='verify-email' element={<Vrification />}></Route>
        <Route path='resend-verification' element={<ResendVerification />}></Route>
        <Route path='verify/:token' element={<Verified />}></Route>
        <Route path='forgot-password' element={<ForgotPassword />}></Route>
        <Route path='reset-password/:token' element={<ResetPassword />}></Route>
        <Route path='unauthorized' element={<Unauthorized />}></Route>
    </>
);

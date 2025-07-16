import { Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Vrification from '../pages/auth/Vrification';
import Verified from '../pages/auth/Verified';

export const authChildren = (

    <>
        <Route index element={<Login />} />
        <Route path='login' index={true} element={<Login />}></Route>
        <Route path='register' element={<Register />}></Route>
        <Route path='verify-email' element={<Vrification />}></Route>
        <Route path='verify/:token' element={<Verified />}></Route>
    </>
);

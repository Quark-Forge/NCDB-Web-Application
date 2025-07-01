import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store.js';
import './index.css';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Verified from './pages/Verified.jsx';
import Vrification from './pages/Vrification.jsx';
import EditProfile from './pages/EditProfile.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/' index={true} element={<Home />}></Route>
      <Route path='/login' index={true} element={<Login />}></Route>
      <Route path='/register' element={<Register />}></Route>
      <Route path='/verify-email' element={<Vrification />}></Route>
      <Route path='/verify/:token' element = {<Verified />}></Route>
      <Route path='/profile/edit' element={<EditProfile />}></Route>

      {/* Private Routes */}
      <Route path='' element={<PrivateRoute />}>
{/*         
        <Route path='/home' element={<Home />}></Route> */}
      </Route>
    </Route>

  )
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  </Provider>
);

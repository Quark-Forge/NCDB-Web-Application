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
import Profile from './pages/Profile.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/' index={true} element={<Login />}></Route>
      <Route path='/home' element={<Home />}></Route>
      <Route path='/register' element={<Register />}></Route>

      {/* Private Routes */}
      <Route path='' element={<PrivateRoute />}>
        <Route path='/profile' element={<Profile />}></Route>
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

import { BrowserRouter, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import 'react-toastify/ReactToastify.css';
import store from './store';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <>
      <Provider store={store}>
        <ToastContainer />
          <BrowserRouter>
            <AppRoutes/>
          </BrowserRouter>
      </Provider>
    </>
  )
}

export default App;
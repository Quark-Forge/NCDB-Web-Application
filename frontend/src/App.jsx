import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
const App = () => {
  return (
    <>
      <ToastContainer />
      <Outlet />
    </>
  )
}

export default App;
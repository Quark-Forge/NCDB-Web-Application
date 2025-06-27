import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
      >
        <img
          src="../../images/user.png"
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
          <button

            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => navigate('/profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            onClick={logoutHandler}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

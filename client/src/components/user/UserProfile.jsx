import React from 'react';
import { X, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../../slices/usersApiSlice'; 
import { clearCredentials } from '../../slices/authSlice'; 
import { toast } from 'react-toastify';

const UserProfile = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApiCall, { isLoading }] = useLogoutMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const handleSignOut = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/');
      toast.success('Logged out successfully');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 pointer-events-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close profile"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Profile Details */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={userInfo?.avatar || "/images/user.png"}
                alt="User Profile"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/user.png";
                }}
              />
              <div>
                <h3 className="text-xl font-medium text-gray-800">
                  {userInfo?.name || "Guest"}
                </h3>
                <p className="text-sm text-gray-500">
                  {userInfo?.email || "No email available"}
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Account Details</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Member since: {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>

              {/* Settings Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Settings</h4>
                <ul className="mt-2 space-y-2">
                  <li>
                    <button 
                      className="flex items-center w-full text-left p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => navigate('/user/settings')}
                    >
                      <Settings className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-700">Account Settings</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`flex items-center w-full text-left p-2 rounded-lg transition-colors ${
                        isLoading 
                          ? 'text-red-300 cursor-not-allowed' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      onClick={handleSignOut}
                      disabled={isLoading}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      <span className="text-sm">
                        {isLoading ? 'Logging Out...' : 'Logout'}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button 
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={() => navigate('/user/profile/edit')}
              disabled={isLoading}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
import React from 'react';
import { X, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ Import useSelector

const UserProfile = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth); // ✅ Get userInfo from Redux

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Popup Panel - Overlapping only, no overlay */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 pointer-events-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Profile Details */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src="/images/user.png"
                alt="User Profile"
                className="w-16 h-16 rounded-full object-cover"
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
                <p className="text-sm text-gray-600 mt-1">Member since: January 2024</p>
                <p className="text-sm text-gray-600">Orders: 12</p>
              </div>

              {/* Settings Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Settings</h4>
                <ul className="mt-2 space-y-2">
                  <li>
                    <button className="flex items-center w-full text-left p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Settings className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-700">Account Settings</span>
                    </button>
                  </li>
                  <li>
                    <button className="flex items-center w-full text-left p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <LogOut className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-700">Sign Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button 
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/profile/edit')}
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

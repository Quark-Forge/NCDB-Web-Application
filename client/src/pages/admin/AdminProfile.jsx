import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useUpdateUserMutation } from "../../slices/usersApiSlice";
import { Edit2, Check, X, ArrowLeft, Lock, User } from 'lucide-react';

const AdminProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setContactNumber(userInfo.contact_number || "");
      setAddress(userInfo.address || "");
    }
  }, [userInfo]);

  const validateField = (fieldName, value) => {
    let error = "";
    if (fieldName === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
      error = "Invalid email format";
    } else if (fieldName === "contactNumber" && !/^\d{10}$/.test(value)) {
      error = "Contact number must be 10 digits";
    } else if (fieldName === "password" && value && value.length < 8) {
      error = "Password must be at least 8 characters";
    } else if (fieldName === "confirmPassword" && value !== password) {
      error = "Passwords do not match";
    }
    return error;
  };

  const handleChange = (fieldName, value, setter) => {
    setter(value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPassword("");
    setConfirmPassword("");
    setShowPasswordSection(false);
    setErrors({});
    // Reset to original values
    setName(userInfo.name);
    setEmail(userInfo.email);
    setContactNumber(userInfo.contact_number || "");
    setAddress(userInfo.address || "");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: validateField("email", email),
      contactNumber: validateField("contactNumber", contactNumber),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      toast.error("Please fill out all fields correctly");
      return;
    }

    try {
      const payload = {
        id: userInfo.id,
        name,
        email,
        ...(password && { password }), // Only include password if it's provided
        address,
        contact_number: contactNumber
      };

      const res = await updateProfile(payload).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Profile Updated');
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      navigate('/admin/profile');
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Update failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <User className="h-6 w-6 mr-2" />
                {userInfo.user_role} Profile
              </h1>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-3 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={submitHandler}
                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    disabled={isLoading}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Admin profile"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {userInfo.user_role}
                </span>
              </div>

              {/* Profile Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => handleChange("name", e.target.value, setName)}
                        className={`w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => handleChange("email", e.target.value, setEmail)}
                        className={`w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={contactNumber}
                        onChange={(e) => handleChange("contactNumber", e.target.value, setContactNumber)}
                        className={`w-full px-3 py-2 border ${errors.contactNumber ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{contactNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <>
                      <textarea
                        name="address"
                        value={address}
                        onChange={(e) => handleChange("address", e.target.value, setAddress)}
                        rows={3}
                        className={`w-full px-3 py-2 border ${errors.address ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            {isEditing && (
              <div className="mt-10 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Change Password
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPasswordSection ? 'Hide' : 'Change Password'}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => handleChange("password", e.target.value, setPassword)}
                        className={`w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value, setConfirmPassword)}
                        className={`w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
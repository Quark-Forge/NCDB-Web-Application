import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useUpdateUserMutation } from "../../slices/usersApiSlice";
import { useUploadProfilePhotoMutation, useDeleteProfilePhotoMutation } from "../../slices/uploadApiSlice";
import ImageUpload from "../../components/common/ImageUpload";
import { User, Trash2, Loader2 } from "lucide-react";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateUserMutation();
  const [deleteProfilePhoto, { isLoading: isDeleting }] = useDeleteProfilePhotoMutation();

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        contact_number: userInfo.contact_number || "",
        address: userInfo.address || "",
        password: "",
        confirmPassword: ""
      });
      setProfileImage(userInfo.image_url || userInfo.profile_photo || null);
    }
  }, [userInfo]);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "email":
        if (!value) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        return "";
      case "contact_number":
        if (value && !/^\d{10}$/.test(value)) return "Contact number must be 10 digits";
        return "";
      case "password":
        if (value && value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (value !== formData.password) return "Passwords do not match";
        return "";
      case "name":
      case "address":
        if (!value) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    setErrors({
      ...errors,
      [fieldName]: validateField(fieldName, formData[fieldName])
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate field if it's been touched before
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleImageChange = (imageUrl) => {
    setProfileImage(imageUrl);
    setHasImageChanged(true);

    // Immediately update the user info in Redux store with the new image URL
    if (userInfo && imageUrl) {
      dispatch(setCredentials({
        ...userInfo,
        image_url: imageUrl,
        profile_photo: imageUrl
      }));
    }
  };

  const handleImageUploadStart = () => {
    setIsImageUploading(true);
  };

  const handleImageUploadEnd = () => {
    setIsImageUploading(false);
    setHasImageChanged(false);
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      setIsImageUploading(true);
      await deleteProfilePhoto().unwrap();
      setProfileImage(null);
      setHasImageChanged(true);

      // Update Redux store
      if (userInfo) {
        dispatch(setCredentials({
          ...userInfo,
          image_url: null,
          profile_photo: null
        }));
      }

      toast.success('Profile photo deleted successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete profile photo');
    } finally {
      setIsImageUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      if (field !== "confirmPassword") { // Skip confirmPassword for general validation
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    // Special check for password confirmation
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {})
    );
    return isValid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    // Don't submit if image is currently uploading
    if (isImageUploading) {
      toast.error('Please wait for image upload to complete');
      return;
    }

    try {
      const { confirmPassword, ...updateData } = formData;
      const payload = {
        id: userInfo.id,
        ...updateData,
        // Only include password if it was changed
        password: updateData.password || undefined,
        // Include the image_url if it was updated
        ...(hasImageChanged && { image_url: profileImage })
      };

      const res = await updateProfile(payload).unwrap();

      // Update Redux store with the complete response
      dispatch(setCredentials({
        ...userInfo,
        ...res,
        image_url: profileImage || userInfo.image_url,
        profile_photo: profileImage || userInfo.profile_photo
      }));

      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Update failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const getInputClass = (fieldName) =>
    `w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors[fieldName]
      ? "border-red-500 focus:ring-red-300"
      : "border-gray-300 focus:ring-blue-300"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Update Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Update your account information below
          </p>
        </div>

        {/* Profile Image Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {profileImage ? (
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
                <button
                  onClick={handleDeleteProfilePhoto}
                  disabled={isDeleting || isImageUploading}
                  className="absolute -bottom-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
            )}
          </div>

          <div className="w-full max-w-xs">
            <ImageUpload
              currentImage={profileImage}
              onImageChange={handleImageChange}
              onUploadStart={handleImageUploadStart}
              onUploadEnd={handleImageUploadEnd}
              entityId={userInfo?.id}
              entityType="profile"
              className="w-full"
              canDelete={false} // We handle delete separately
            />
          </div>

          {isImageUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                <span className="text-sm text-blue-700">Profile photo upload in progress...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submitHandler} className="mt-8 space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                className={getInputClass("name")}
                required
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                className={getInputClass("email")}
                required
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                id="contact_number"
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleChange}
                onBlur={() => handleBlur("contact_number")}
                className={getInputClass("contact_number")}
                placeholder="10-digit number"
              />
              {errors.contact_number && touched.contact_number && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur("address")}
                rows="3"
                className={getInputClass("address")}
              />
              {errors.address && touched.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password (leave blank to keep current)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                className={getInputClass("password")}
                placeholder="Minimum 8 characters"
              />
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {formData.password && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={getInputClass("confirmPassword")}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={isImageUploading}
              className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isImageUploading}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Updating...
                </>
              ) : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
import { useState } from "react";
import { useRegisterMutation } from "../../slices/usersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FaSpinner, FaEye, FaEyeSlash, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const validateField = (fieldName, value) => {
    let error = "";

    if (!value) {
      error = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (fieldName === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
      error = "Invalid email format";
    } else if (fieldName === "contact_number" && !/^\d{10}$/.test(value)) {
      error = "Contact number must be 10 digits";
    } else if (fieldName === "password") {
      if (value.length < 8) {
        error = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(value)) {
        error = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(value)) {
        error = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(value)) {
        error = "Password must contain at least one number";
      }
    } else if (fieldName === "confirmPassword" && value !== formData.password) {
      error = "Passwords do not match";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change only if there's already an error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }

    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      setApiError("Please correct the errors in the form");
      return;
    }

    try {
      const { confirmPassword, ...payload } = formData;
      await register(payload).unwrap();
      navigate('/auth/verify-email', { state: { email: formData.email } });
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Registration failed";
      setApiError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-blue-50 rounded-full opacity-30 blur-2xl"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md mx-4 border border-blue-100 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join NCDB Mart today</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">Registration failed</p>
              <p className="text-red-700 text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 text-xs" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 text-xs" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${errors.password ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FaExclamationTriangle className="mr-1 text-xs" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${errors.confirmPassword ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <FaExclamationTriangle className="mr-1 text-xs" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              id="contact_number"
              name="contact_number"
              placeholder="0123456789"
              value={formData.contact_number}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.contact_number ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
            />
            {errors.contact_number && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 text-xs" />
                {errors.contact_number}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              placeholder="Enter your complete address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.address ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 text-xs" />
                {errors.address}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-lg ${isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-blue-100">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
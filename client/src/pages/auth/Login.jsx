import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import { FaSpinner, FaEye, FaEyeSlash, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const allowedRoles = ['Admin', 'Order Manager', 'Inventory Manager'];

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      let redirectPath = location.state?.from?.pathname || '/';
      if (allowedRoles.includes(userInfo.user_role)) {
        redirectPath = '/admin/dashboard';
      } else if (userInfo.user_role === 'Supplier') {
        redirectPath = '/suppliers/dashboard';
      }
      navigate(redirectPath);
    }
  }, [userInfo, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    try {
      const res = await login(formData).unwrap();

      // Check if user needs verification
      if (!res.is_verified) {
        // Redirect to verification page instead of setting credentials
        navigate('/auth/resend-verification', {
          state: { email: formData.email, userName: res.name }
        });
        return;
      }

      // User is verified - proceed with normal login
      dispatch(setCredentials({ ...res }));

      // Navigate based on role or redirect path
      const redirectPath = location.state?.from?.pathname ||
        (res.user_role === 'Admin' ? '/admin/dashboard' : '/');
      navigate(redirectPath);

    } catch (err) {
      const errorMessage = err?.data?.message || err.error || 'Login failed';

      if (errorMessage.includes('Invalid email') || errorMessage.includes('Invalid password') || errorMessage.includes('credentials')) {
        setApiError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('verified')) {
        setApiError('Please verify your email address before logging in.');
      } else {
        setApiError(errorMessage);
      }
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
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your NCDB Mart account</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">Login failed</p>
              <p className="text-red-700 text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email
                  ? 'border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 text-xs" />
                {errors.email}
              </p>
            )}
          </div>

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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${errors.password
                    ? 'border-red-500 focus:ring-red-200 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                value={formData.password}
                onChange={handleInputChange}
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

          <div className="flex items-center justify-between">
            <div></div> {/* Empty div to maintain flex layout */}
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-lg ${isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2'
              }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="text-center pt-4 border-t border-blue-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
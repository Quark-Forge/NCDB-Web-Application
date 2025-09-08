import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import { FaSpinner, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

const allowedRoles = ['Admin', 'Order Manager', 'Inventory Manager'];

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      const redirectPath = location.state?.from?.pathname ||
        (allowedRoles.includes(userInfo.user_role) ? '/admin/dashboard' : '/');
      navigate(redirectPath);
    }
  }, [userInfo, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
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

    if (!validateForm()) return;

    try {
      const res = await login(formData).unwrap();
      dispatch(setCredentials({ ...res }));

      // Success toast
      // toast.success(`Welcome back, ${res.name || 'User'}!`, {
      //   autoClose: 2000,
      // });

      // Navigate based on role or redirect path
      const redirectPath = location.state?.from?.pathname ||
        (res.user_role === 'Admin' ? '/admin/dashboard' : '/');
      navigate(redirectPath);

    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Login failed', {
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft className="mr-1" />
            Back to Home
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Sign in</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-2 px-4 rounded-md text-white font-medium ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition duration-200`}
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

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verification = () => {
  const { state } = useLocation();
  const email = state?.email || 'your email';

  const navigate = useNavigate();

  const handleResendEmail = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/resend-verification', { email });
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Registration Successful!
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <span className="font-semibold text-gray-800">{email}</span>.
              Please check your inbox and click the link to activate your account.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              Didn't receive the email? Check your spam folder or resend it below.
            </p>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleResendEmail}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification Email
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-gray-300"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verified = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || 'your email';
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setIsVerifying(true);
        const response = await axios.get(`http://localhost:5000/api/users/verify/${token}`);
        toast.success(response.data.message);

        // Brief delay before redirect to show success message
        setTimeout(() => {
          navigate('/', { state: { emailVerified: true } });
        }, 1500);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Verification failed';
        toast.error(errorMessage);

        // Redirect with delay to allow error message to be seen
        setTimeout(() => {
          navigate('/user/verify-email', { state: { email } });
        }, 1500);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate, email]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {isVerifying ? (
            <>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                Verifying your email...
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we confirm your email address.
              </p>
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-green-500"
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
              <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                Verification Complete!
              </h2>
              <p className="mt-2 text-gray-600">
                You're being redirected to the login page.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verified;
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useVerifyEmailMutation } from '../../slices/usersApiSlice';
import axios from 'axios';

const Verified = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || 'your email';
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    const verifyEmailHandler = async () => {
      try {
        setStatus('verifying');
        const response = await verifyEmail(token).unwrap();

        setStatus('success');
        setMessage(response.message);
        toast.success(response.message);

        setTimeout(() => {
          navigate('/auth/login', { state: { emailVerified: true } });
        }, 3000);
      } catch (err) {
        const errorMessage = err?.data?.message || 'Verification failed';

        setStatus('error');
        setMessage(errorMessage);
        toast.error(errorMessage);

        setTimeout(() => {
          navigate('/auth/resend-verification', { state: { email } });
        }, 3000);
      }
    };

    if (token) {
      verifyEmailHandler();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
      toast.error('No verification token provided.');
      setTimeout(() => {
        navigate('/auth/resend-verification');
      }, 3000);
    }
  }, [token, navigate, email, verifyEmail]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
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
        );

      case 'success':
        return (
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
            <p className="mt-2 text-green-600 font-medium">{message}</p>
            <p className="mt-2 text-gray-600">
              You're being redirected to the login page.
            </p>
          </>
        );

      case 'error':
        return (
          <>
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-red-600 font-medium">{message}</p>
            <p className="mt-2 text-gray-600">
              You're being redirected to the verification page.
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {renderContent()}

          {/* Manual navigation buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/auth/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </button>

            {status === 'error' && (
              <button
                onClick={() => navigate('/auth/resend-verification', { state: { email } })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verified;
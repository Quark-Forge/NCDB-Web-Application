import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useResendVerificationMutation } from '../../slices/usersApiSlice';

const ResendVerification = () => {
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const [resendVerification, { isLoading }] = useResendVerificationMutation();

    useEffect(() => {
        // Get email from location state
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendVerification = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            await resendVerification({ email }).unwrap();
            toast.success('Verification email sent! Check your inbox.');
            setCountdown(60); // 60 seconds cooldown
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to send verification email');
        }
    };

    const handleBackToLogin = () => {
        navigate('/auth/login', {
            state: { email }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBackToLogin}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Login
                        </button>
                    </div>

                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                            <FaEnvelope className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Verify Your Email
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please verify your email address to access your account
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleResendVerification}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || countdown > 0}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading || countdown > 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : countdown > 0 ? (
                                    `Resend in ${countdown}s`
                                ) : (
                                    'Send Verification Email'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Didn't receive the email?</p>
                        <ul className="mt-2 text-xs space-y-1">
                            <li>• Check your spam folder</li>
                            <li>• Make sure you entered the correct email address</li>
                            <li>• Wait a few minutes and try again</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResendVerification;
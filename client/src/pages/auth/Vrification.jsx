import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Vrification = () => {
  const { state } = useLocation();
  const email = state?.email || 'your email';
  console.log(email);
  
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
    <div className='space-x-10'>
      <h1>🎉 Registration successful!</h1>
      <p>Please check your email inbox at {email}. Click the verification link to activate your account.</p>
      <button
        onClick={handleResendEmail}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Resend Verification Email
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Back Home
      </button>
    </div>
  );
};

export default Vrification;
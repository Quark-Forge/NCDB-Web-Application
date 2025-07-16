import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verified = () => {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();

  const { state } = useLocation();
  const email = state?.email || 'your email';

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/verify/${token}`);
        toast.success(response.data.message);
        navigate('/'); // Redirect to login after verification
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Verification failed';
        toast.error(errorMessage);
        // Redirect back if verification fails
        navigate('/verify-email', { state: { email: email } });
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div>
      <h2>Verifying your email...</h2>
    </div>
  );
};

export default Verified;
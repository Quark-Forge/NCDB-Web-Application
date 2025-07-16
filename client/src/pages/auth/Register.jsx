import { useState } from "react";
import { useRegisterMutation } from "../../slices/usersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact_number, setContact_number] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();

  const validateField = (fieldName, value) => {
    let error = "";
    if (!value) {
      error = `${fieldName} is required`;
    } else if (fieldName === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
      error = "Invalid email format";
    } else if (fieldName === "contact_number" && !/^\d{10}$/.test(value)) {
      error = "Contact number must be 10 digits";
    } else if (fieldName === "password" && value.length < 8) {
      error = "Password must be at least 8 characters";
    } else if (fieldName === "confirmPassword" && value !== password) {
      error = "Passwords do not match";
    }
    return error;
  };

  const handleChange = (fieldName, value, setter) => {
    setter(value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateField("name", name),
      email: validateField("email", email),
      contact_number: validateField("contact_number", contact_number),
      address: validateField("address", address),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      toast.error("Please fill out all fields correctly");
      return;
    }

    try {
      const payload = { name, email, password, address, contact_number };
      const res = await register(payload).unwrap();
      navigate('/verify-email', {state: { email: email }});
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Registration failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form
        onSubmit={submitHandler}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md space-y-5"
        noValidate
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">User Registration</h2>

        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => handleChange("name", e.target.value, setName)}
            className={`w-full px-4 py-2 border ${
              errors.name ? "border-red-500" : "border-blue-400"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => handleChange("email", e.target.value, setEmail)}
            className={`w-full px-4 py-2 border ${
              errors.email ? "border-red-500" : "border-blue-400"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => handleChange("password", e.target.value, setPassword)}
            className={`w-full px-4 py-2 border ${
              errors.password ? "border-red-500" : "border-blue-400"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value, setConfirmPassword)}
            className={`w-full px-4 py-2 border ${
              errors.confirmPassword ? "border-red-500" : "border-blue-400"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        <div>
          <input
            type="text"
            name="contact_number"
            value={contact_number}
            onChange={(e) => handleChange("contact_number", e.target.value, setContact_number)}
            placeholder="Enter mobile number"
            className={`w-full px-4 py-2 border ${
              errors.contact_number ? "border-red-500" : "border-blue-400"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          {errors.contact_number && <p className="text-red-500 text-sm">{errors.contact_number}</p>}
        </div>

        <div>
          <input
            type="text"
            name="address"
            value={address}
            onChange={(e) => handleChange("address", e.target.value, setAddress)}
            placeholder="Address"
            className={`w-full px-4 py-2 border ${
              errors.address ? "border-red-500" : "border-blue-400"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300`}
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {isLoading && <h2 className="text-blue-500">Loading...</h2>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
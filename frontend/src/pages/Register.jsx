import { useState } from "react";

const rols = [
    { id: '1', role_name: 'Admin' },
    { id: '2', role_name: 'Member' },
    { id: '3', role_name: 'Marketing Officer' },
];

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "",
        password: "",

    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactNumber = (e) => {
        const value = e.target.value;
        const isValid = /^[0-9]{10}$/.test(value);

        setFormData(prev => ({ ...prev, phone: value }));

        if (!isValid) {
            setError('Enter a valid 10-digit contact number number');
        } else {
            setError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) {
            alert("Fix validation errors first.");
            return;
        }

        console.log("Form submitted:", formData);
        // TODO: Send formData to backend (via axios)
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md space-y-5"
            >
                <h2 className="text-2xl font-bold text-center text-gray-700">User Registration</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleContactNumber}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                />
                {error && <span className="text-red-500 text-sm">{error}</span>}

                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                >
                    <option value="" disabled>Select Role</option>
                    {rols.map((rol) => (
                        <option key={rol.id} value={rol.role_name}>{rol.role_name}</option>
                    ))}
                </select>

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

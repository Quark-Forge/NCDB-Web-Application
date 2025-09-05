import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit3,
    Save,
    X,
    Camera,
    Shield,
    CreditCard,
    Heart,
    Package,
    Clock,
    CheckCircle
} from 'lucide-react';

import { setCredentials } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import { useGetUserProfileQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';

const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);

    const { data: response, refetch, isLoading } = useGetUserProfileQuery();
    const [updateProfile, { isLoading: updating }] = useUpdateUserMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact_number: '',
        address: ''
    });

    // Extract user data from response
    const userData = response?.user;

    // Set form data when user data is loaded
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                contact_number: userData.contact_number || '',
                address: userData.address || ''
            });
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const res = await updateProfile(formData).unwrap();
            // Update both the userInfo in auth slice and the form data
            dispatch(setCredentials({ ...userInfo, ...res }));
            toast.success('Profile updated successfully');
            setIsEditing(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: userData.name || '',
            email: userData.email || '',
            contact_number: userData.contact_number || '',
            address: userData.address || ''
        });
        setIsEditing(false);
    };

    const stats = [
        { icon: Package, label: 'Total Orders', value: '12', color: 'blue' },
        { icon: CheckCircle, label: 'Completed', value: '10', color: 'green' },
        { icon: Clock, label: 'Pending', value: '2', color: 'yellow' },
        { icon: Heart, label: 'Wishlist', value: '8', color: 'pink' }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-96 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-48 bg-gray-200 rounded-lg"></div>
                                <div className="h-48 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={updating}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Profile Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                        <User className="h-12 w-12 text-white" />
                                    </div>
                                    {isEditing && (
                                        <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                                            <Camera className="h-4 w-4 text-gray-600" />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Full Name"
                                            />
                                        ) : (
                                            userData?.name || 'User Name'
                                        )}
                                    </h2>
                                    <p className="text-gray-600">Member since {new Date(userData?.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Email Address"
                                            />
                                        ) : (
                                            <span className="text-gray-600">{userData?.email}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="contact_number"
                                                value={formData.contact_number}
                                                onChange={handleInputChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Phone Number"
                                            />
                                        ) : (
                                            <span className="text-gray-600">{userData?.contact_number || 'Not provided'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                        {isEditing ? (
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Full Address"
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-gray-600">{userData?.address || 'No address provided'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">Order #ORD{1000 + item} placed</p>
                                            <p className="text-xs text-gray-500">2 days ago</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Overview */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                        <stat.icon className={`h-6 w-6 mx-auto mb-2 text-${stat.color}-500`} />
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-600">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/user/myorders')}
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Package className="h-5 w-5 text-blue-500" />
                                    <span>My Orders</span>
                                </button>
                                <button
                                    onClick={() => navigate('/user/wishlist')}
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Heart className="h-5 w-5 text-pink-500" />
                                    <span>Wishlist</span>
                                </button>
                                <button
                                    onClick={() => navigate('/user/settings')}
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Shield className="h-5 w-5 text-yellow-500" />
                                    <span>Settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Verified Account</p>
                                    <p className="text-xs text-green-600">Your account is fully verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
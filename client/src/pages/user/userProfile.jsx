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
    Shield,
    Heart,
    Package,
    Clock,
    CheckCircle,
    Trash2,
    Loader2
} from 'lucide-react';

import { setCredentials } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import { useGetUserProfileQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';
import { useUploadProfilePhotoMutation, useDeleteProfilePhotoMutation } from '../../slices/uploadApiSlice';
import { useGetMyOrdersQuery } from '../../slices/ordersApiSlice';
import { useGetCartQuery } from '../../slices/cartApiSlice';
import ImageUpload from '../../components/common/ImageUpload';

const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);

    const { data: userResponse, refetch, isLoading } = useGetUserProfileQuery();
    const [updateProfile, { isLoading: updating }] = useUpdateUserMutation();
    const [deleteProfilePhoto, { isLoading: isDeleting }] = useDeleteProfilePhotoMutation();

    // Fetch real data for orders and cart
    const { data: ordersResponse, isLoading: ordersLoading } = useGetMyOrdersQuery();
    const { data: cartResponse, isLoading: cartLoading } = useGetCartQuery();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact_number: '',
        address: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [hasImageChanged, setHasImageChanged] = useState(false);

    // Extract user data from response
    const userData = userResponse?.user;

    // Extract orders data from response
    const ordersData = ordersResponse?.data || [];

    // Extract cart data from response
    const cartData = cartResponse?.data;

    // Calculate order statistics
    const calculateOrderStats = () => {
        if (!ordersData || ordersData.length === 0) return { total: 0, completed: 0, pending: 0 };

        const total = ordersData.length;
        const completed = ordersData.filter(order =>
            order.status === 'delivered'
        ).length;
        const pending = ordersData.filter(order =>
            order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped'
        ).length;

        return { total, completed, pending };
    };

    // Calculate wishlist items (assuming wishlist items are in cart with is_wishlist flag)
    const wishlistCount = cartData?.CartItems?.filter(item => item.is_wishlist)?.length || 0;

    const orderStats = calculateOrderStats();

    // Set form data when user data is loaded
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                contact_number: userData.contact_number || '',
                address: userData.address || ''
            });
            // Use image_url from backend
            setProfileImage(userData.image_url || null);
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
            const payload = {
                ...formData,
                ...(hasImageChanged && { image_url: profileImage })
            };

            const res = await updateProfile(payload).unwrap();

            // Update both the userInfo in auth slice and the form data
            dispatch(setCredentials({
                ...userInfo,
                ...res,
                image_url: profileImage || userInfo.image_url
            }));

            toast.success('Profile updated successfully');
            setIsEditing(false);
            setHasImageChanged(false);
            await refetch(); // Ensure fresh data from server
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
        setProfileImage(userData.image_url || null);
        setHasImageChanged(false);
        setIsEditing(false);
    };

    const handleImageChange = async (imageUrl) => {
        setProfileImage(imageUrl);
        setHasImageChanged(true);

        // Immediately update Redux store
        if (userInfo) {
            dispatch(setCredentials({
                ...userInfo,
                image_url: imageUrl
            }));
        }
    };

    const handleImageUploadStart = () => {
        setIsImageUploading(true);
    };

    const handleImageUploadEnd = async () => {
        setIsImageUploading(false);
        setHasImageChanged(false);
        // Refetch user data to ensure everything is synchronized with database
        await refetch();
    };

    const handleDeleteProfilePhoto = async () => {
        try {
            setIsImageUploading(true);
            await deleteProfilePhoto().unwrap();
            setProfileImage(null);
            setHasImageChanged(true);

            // Update Redux store immediately
            if (userInfo) {
                dispatch(setCredentials({
                    ...userInfo,
                    image_url: null
                }));
            }

            toast.success('Profile photo deleted successfully');
            await refetch(); // Refetch to sync with database
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete profile photo');
        } finally {
            setIsImageUploading(false);
        }
    };

    // Format recent activities from orders
    const recentActivities = ordersData?.slice(0, 3).map(order => ({
        id: order.id,
        message: `Order ${order.order_number} placed`,
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        status: order.status
    })) || [];

    const stats = [
        {
            icon: Package,
            label: 'Total Orders',
            value: orderStats.total.toString(),
            color: 'blue'
        },
        {
            icon: CheckCircle,
            label: 'Completed',
            value: orderStats.completed.toString(),
            color: 'green'
        },
        {
            icon: Clock,
            label: 'Pending',
            value: orderStats.pending.toString(),
            color: 'yellow'
        },
        {
            icon: Heart,
            label: 'Wishlist',
            value: wishlistCount.toString(),
            color: 'pink'
        }
    ];

    // Get status color for recent activities
    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'green';
            case 'pending':
            case 'confirmed':
                return 'yellow';
            case 'shipped':
                return 'blue';
            case 'cancelled':
                return 'red';
            default:
                return 'gray';
        }
    };

    // Get status text for display
    const getStatusText = (status) => {
        switch (status) {
            case 'delivered':
                return 'Delivered';
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'shipped':
                return 'Shipped';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const color = getStatusColor(status);
        switch (color) {
            case 'green':
                return 'bg-green-100 text-green-800';
            case 'yellow':
                return 'bg-yellow-100 text-yellow-800';
            case 'blue':
                return 'bg-blue-100 text-blue-800';
            case 'red':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format member since date
    const formatMemberSince = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

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
                                disabled={updating || isImageUploading}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isImageUploading}
                                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
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
                                    {profileImage ? (
                                        <div className="relative">
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                            />
                                            {isEditing && (
                                                <div className="absolute -bottom-2 -right-2 flex gap-1">
                                                    <button
                                                        onClick={handleDeleteProfilePhoto}
                                                        disabled={isDeleting || isImageUploading}
                                                        className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                                            <img
                                                src={"../../images/user.png"}
                                                alt="Avatar"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
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
                                    <p className="text-gray-600">
                                        Member since {formatMemberSince(userData?.createdAt)}
                                    </p>

                                    {/* Profile Image Upload Section */}
                                    {isEditing && (
                                        <div className="mt-4">
                                            <ImageUpload
                                                currentImage={profileImage}
                                                onImageChange={handleImageChange}
                                                onUploadStart={handleImageUploadStart}
                                                onUploadEnd={handleImageUploadEnd}
                                                entityId={userInfo?.id}
                                                entityType="profile"
                                                className="max-w-xs"
                                                canDelete={false} // We handle delete separately
                                            />
                                        </div>
                                    )}
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

                            {/* Image Upload Status */}
                            {isImageUploading && (
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                                        <span className="text-sm text-blue-700">Profile photo upload in progress...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700">{activity.message}</p>
                                                <p className="text-xs text-gray-500">{activity.date}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(activity.status)}`}
                                            >
                                                {getStatusText(activity.status)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No recent activity</p>
                                    </div>
                                )}
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
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${userData?.is_verified
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-yellow-50 border border-yellow-200'
                                }`}>
                                {userData?.is_verified ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Verified Account</p>
                                            <p className="text-xs text-green-600">Your account is fully verified</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-5 w-5 text-yellow-500" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Pending Verification</p>
                                            <p className="text-xs text-yellow-600">Your account is pending verification</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
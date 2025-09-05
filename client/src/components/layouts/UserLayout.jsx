import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../user/UserNavbar';

const UserLayout = () => {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    
    return (
        <div className="min-h-screen bg-white">
            <UserNavbar />
            <Outlet context={{ 
                cartCount, 
                setCartCount, 
                cartItems, 
                setCartItems
            }} />
        </div>
    )
}

export default UserLayout;
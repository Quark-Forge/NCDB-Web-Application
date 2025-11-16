import { useState, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../home/Navbar';

const HomeLayout = () => {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);

    // Memoized context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        cartCount,
        setCartCount,
        cartItems,
        setCartItems,
    }), [cartCount, cartItems]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar cartItems={cartItems} />
            <main className="flex-1">
                <Outlet context={contextValue} />
            </main>
        </div>
    )
}

export default HomeLayout;
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../home/Navbar';

const HomeLayout = () => {
    const [cartCount, setCartCount] = useState(0);
    const [search, setSearch] = useState('');
    const [cartItems, setCartItems] = useState([]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar cartCount={cartCount} search={search} setSearch={setSearch} cartItems={cartItems} />
            <Outlet context={{
                cartCount,
                setCartCount,
                cartItems,
                setCartItems,
                search,
                setSearch
            }} />
        </div>
    )
}

export default HomeLayout;
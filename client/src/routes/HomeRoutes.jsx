import { Route } from 'react-router-dom';
import Home from '../pages/home/Home';
import ProductDetail from '../pages/home/ProductDetail';

export const homeChildren = (
    <>
        <Route index element={<Home />} />
        <Route path="/product/:supplierItemId?" element={<ProductDetail />} />

    </>
);

import { Route } from 'react-router-dom';
import Home from '../pages/home/Home';

export const homeChildren = (
    <>
        <Route index element={<Home />} />

    </>
);

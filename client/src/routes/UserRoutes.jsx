import { Route } from "react-router-dom";
import EditProfile from "../pages/user/EditProfile";
import Cart from "../pages/user/Cart";

export const userChildren = (
    <>
        <Route path='profile/edit' element={<EditProfile />}></Route>
        <Route path='cart' element={<Cart/>}></Route>
    </>
);

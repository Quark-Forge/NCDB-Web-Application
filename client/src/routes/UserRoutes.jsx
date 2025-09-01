import { Route } from "react-router-dom";
import EditProfile from "../pages/user/EditProfile";
import Cart from "../pages/user/Cart";
import PastOrders from "../pages/user/PastOrder";

export const userChildren = (
    <>
        <Route path='profile/edit' element={<EditProfile />}></Route>
        <Route path='cart' element={<Cart/>}></Route>
        <Route path='myorders' element={<PastOrders/>}></Route>
    </>
);

import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Requests from "../pages/suppliers/Requests";
import SupplierProfile from "../pages/suppliers/SupplierProfile";
import SupplierDashboard from "../pages/suppliers/SupplierDashboard";
import SupplierPurchases from "../pages/admin/purchase/SupplierPurchase";
import SupplierRequestDetail from "../pages/suppliers/SupplierRequestDetail";


export const supplierChildren = (
  <>
    <Route element={<ProtectedRoute allowedRoles={['Supplier']} />}>
      <Route path='profile' element={<SupplierProfile />} />
      <Route path="dashboard" element={<SupplierDashboard />} />
      <Route path="requests" element={<Requests />} />
      <Route path="requests/:id" element={<SupplierRequestDetail />} />
    </Route>
  </>
);
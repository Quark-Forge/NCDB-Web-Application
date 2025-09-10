import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Salese from "../pages/suppliers/Salese";
import SupplierProfile from "../pages/suppliers/SupplierProfile";
import SupplierDashboard from "../pages/suppliers/SupplierDashboard";


export const supplierChildren = (
  <>
    <Route element={<ProtectedRoute allowedRoles={['Supplier']} />}>
      <Route path='sales' element={<Salese />} />
      <Route path='profile' element={<SupplierProfile />} />
      <Route path="dashboard" element={<SupplierDashboard />} />
    </Route>
  </>
);
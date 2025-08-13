import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const SupplierDetailModel=({
    supplier,
    onClose,
    onEdit,
    onDelete,
    canEditDelete
})=>{
    const [isConformingDelete,setIsConformingDelete]=useState(false);
    const handleDeleteConfom =()=>{
        onDelete(supplier.id);
        onClose();
    }
    return(<div>hi</div>);
}
export default SupplierDetailModel;
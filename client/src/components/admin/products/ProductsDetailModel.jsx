import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
const ProductDetailModel=({
    product,
    onClose,
    onEdit,
    onDelete,
    canEditDelete
})=>{
    const[isConformingDelete,setIsConformingDelete]=useState(false);
    const handleDeleteConform = ()=>{
        onDelete(product.id);
        onClose();
    };

    return(
        <div>hi</div>


    );


}
export default ProductDetailModel;  
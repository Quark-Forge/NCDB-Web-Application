import ProductCard from "./ProductCard";


const ProductWithSuppliers = ({ product }) => {
    if (!product.SupplierItems || product.SupplierItems.length === 0) {
        return <ProductCard product={product} />;
    }

    return (
        <>
            {product.SupplierItems.map((supplierItem) => (
                <ProductCard
                    key={`${product.id}-${supplierItem.id}`}
                    product={product}
                    supplierItem={supplierItem}
                />
            ))}
        </>
    );
};

export default ProductWithSuppliers;
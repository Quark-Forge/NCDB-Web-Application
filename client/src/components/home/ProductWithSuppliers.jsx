import ProductCard from "./ProductCard";

const ProductWithSuppliers = ({ product, viewMode = 'grid' }) => {
    if (!product.SupplierItems || product.SupplierItems.length === 0) {
        return <ProductCard product={product} viewMode={viewMode} />;
    }

    return (
        <>
            {product.SupplierItems.map((supplierItem) => (
                <ProductCard
                    key={`${product.id}-${supplierItem.id}`}
                    product={product}
                    supplierItem={supplierItem}
                    viewMode={viewMode}
                />
            ))}
        </>
    );
};

export default ProductWithSuppliers;
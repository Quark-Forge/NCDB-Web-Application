const FreeShippingNotice = ({
    currentTotal,
    freeShippingThreshold,
    remainingForFreeShipping
}) => {
    if (currentTotal >= freeShippingThreshold) {
        return (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded">
                <p className="text-green-800 font-medium">
                    🎉 Congratulations! You qualify for free shipping!
                </p>
            </div>
        );
    }

    if (remainingForFreeShipping > 0) {
        return (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-green-800">
                    Add <span className="font-semibold">LKR {remainingForFreeShipping.toFixed(2)}</span> more for free shipping!
                </p>
            </div>
        );
    }

    return null;
};

export default FreeShippingNotice;
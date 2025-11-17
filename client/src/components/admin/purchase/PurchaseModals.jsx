import DeleteConfirmation from '../../common/DeleteConfirmation';

const PurchaseModals = ({
    cancelModal,
    deleteModal,
    onCloseCancel,
    onCloseDelete,
    onConfirmCancel,
    onConfirmDelete
}) => {
    return (
        <>
            {/* Cancel Confirmation Modal */}
            <DeleteConfirmation
                isOpen={cancelModal.isOpen}
                onClose={onCloseCancel}
                onConfirm={onConfirmCancel}
                title="Cancel Request"
                description="Are you sure you want to cancel this request?"
                itemName={cancelModal.request?.SupplierItem?.name}
                confirmText="Cancel Request"
                cancelText="Keep Request"
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmation
                isOpen={deleteModal.isOpen}
                onClose={onCloseDelete}
                onConfirm={onConfirmDelete}
                title="Delete Request"
                description="Are you sure you want to delete this request? This action cannot be undone."
                itemName={deleteModal.request?.SupplierItem?.name}
                confirmText="Delete Request"
                cancelText="Keep Request"
            />
        </>
    );
};

export default PurchaseModals;
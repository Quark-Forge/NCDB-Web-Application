import Card from "../../common/Card";

const RequestSummary = ({ selectedItem, formData }) => {
    return (
        <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Request Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium ml-2">{selectedItem.Product?.name}</span>
                </div>
                <div>
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-medium ml-2">{selectedItem.Supplier?.name}</span>
                </div>
                <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium ml-2">{formData.quantity}</span>
                </div>
                <div>
                    <span className="text-gray-600">Urgency:</span>
                    <span className="font-medium ml-2 capitalize">{formData.urgency}</span>
                </div>
            </div>
        </Card>
    );
};

export default RequestSummary;
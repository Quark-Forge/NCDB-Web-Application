const FormInput = ({
    label,
    name,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    placeholder = '',
    step,
    min,
    options = [],
    ...props
}) => {
    const inputClass = `block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${error ? 'border-red-500' : 'border-gray-300'
        }`;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>

            {type === 'select' ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={inputClass}
                    {...props}
                >
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={3}
                    className={inputClass}
                    placeholder={placeholder}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={inputClass}
                    placeholder={placeholder}
                    step={step}
                    min={min}
                    {...props}
                />
            )}

            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default FormInput;
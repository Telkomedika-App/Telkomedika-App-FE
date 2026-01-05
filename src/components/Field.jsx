export default function InputField({
  type = "text",
  placeholder = "",
  label = "",
  value = "",
  onChange = () => {},
  name = "",
  required = false,
  error = "",
  helpText = "",
  disabled = false,
  showEditIcon = false,
}) {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-gray-800 font-semibold mb-2 text-base">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          disabled={disabled}
          className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent transition ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-white cursor-not-allowed" : ""}`}
          value={value}
          onChange={onChange}
          required={required}
        />
        {showEditIcon && !disabled && (
          <svg
            className="absolute right-3 top-3 w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        )}
      </div>
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
      {helpText && (
        <div className="text-xs text-gray-500 mt-2">{helpText}</div>
      )}
    </div>
  );
}
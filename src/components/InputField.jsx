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
}) {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-gray-800 font-semibold mb-2 text-base">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent transition ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
      {helpText && (
        <div className="text-xs text-gray-500 mt-2">{helpText}</div>
      )}
    </div>
  );
}
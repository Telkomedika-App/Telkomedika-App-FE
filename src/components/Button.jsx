export default function Button({
  type = "button",
  onClick = () => {},
  disabled = false,
  className = "",
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
}) {
  const baseStyles = "font-bold rounded-xl transition disabled:bg-gray-400 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#a71930] text-white hover:bg-[#8b1428]",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-300 text-gray-700 hover:bg-gray-400",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
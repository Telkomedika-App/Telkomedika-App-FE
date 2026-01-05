import useRegisterForm from "../hooks/useRegisterForm";
import { ROUTES } from "../utils/constants";
import InputField from "../components/InputField";
import { Link } from "react-router-dom";

export default function Register() {
  const { form, error, success, loading, handleChange, handleSubmit } = useRegisterForm();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <div className="bg-[#a71930] px-8 py-4 flex justify-between items-center">
        <Link 
          to={ROUTES.LOGIN} 
          className="flex items-center gap-2 text-white hover:opacity-80 transition"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          <span className="font-medium">Kembali</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white rounded-3xl shadow-2xl px-12 py-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-6 mb-8">
              <div className="flex-shrink-0">
                <img
                  src="/telkomedikaLogo.png"
                  alt="TelkoMedika Logo"
                  className="w-28"
                />
              </div>

              <div className="flex-1 text-center">
                <h1 className="text-black text-2xl font-bold">
                  Daftar Akun
                </h1>
              </div>
            </div>

            <div className="px-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  type="text"
                  placeholder="Nama Lengkap"
                  label="Nama Lengkap"
                  value={form.name}
                  onChange={handleChange}
                  name="name"
                  required
                />
                <InputField
                  type="email"
                  placeholder="Email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  name="email"
                  required
                />
                <InputField
                  type="password"
                  placeholder="Password"
                  label="Password"
                  value={form.password}
                  onChange={handleChange}
                  name="password"
                  required
                />
                <InputField
                  type="password"
                  placeholder="Konfirmasi Password"
                  label="Konfirmasi Password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  name="password_confirmation"
                  required
                />
                <InputField
                  type="text"
                  placeholder="No. HP"
                  label="No. HP"
                  value={form.phone}
                  onChange={handleChange}
                  name="phone"
                  required
                />

                {error && (
                  <div className="bg-red-100 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border-l-4 border-green-600 text-green-700 px-4 py-3 rounded text-sm">
                    {success}
                  </div>
                )}

                <div className="text-center text-sm mb-4">
                  Sudah punya akun?{" "}
                  <Link 
                    to={ROUTES.LOGIN} 
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Login
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#a71930] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#8b1428] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Daftar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
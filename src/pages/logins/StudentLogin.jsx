import InputField from "../../components/InputField";
import { ROUTES } from "../../utils/constants";
import useStudentLogin from "../../hooks/useStudentLogin";

export default function StudentLogin() {
  const { form, error, loading, handleChange, handleLogin } = useStudentLogin();

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <InputField
        type="email"
        placeholder="Email"
        label="Username"
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
        helpText={
          <a
            href="https://satu.telkomuniversity.ac.id/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Lupa Password
          </a>
        }
      />
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="text-center text-sm mb-4">
        Belum Punya akun?{" "}
        <a href={ROUTES.REGISTER} className="text-blue-600 hover:underline font-semibold">
          Buat Akun
        </a>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : "Masuk"}
      </button>
    </form>
  );
}
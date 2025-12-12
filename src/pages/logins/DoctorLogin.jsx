import InputField from "../../components/Field";
import Button from "../../components/Button";
import useDoctorLogin from "../../hooks/useDoctorLogin";

export default function DoctorLogin() {
  const { form, error, loading, handleChange, handleLogin } = useDoctorLogin();

  return (
    <form onSubmit={handleLogin} className="space-y-6">
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
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={loading}
        variant="success"
        size="lg"
        fullWidth
      >
        {loading ? "Loading..." : "Masuk"}
      </Button>
    </form>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("http://localhost:3000/api/doctor-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.data?.accessToken) {
        document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=86400; Secure; SameSite=Strict`;
        navigate("/doctor/appointments");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ed1c24] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left: Logo */}
        <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-white">
          <img
            src="/telkomedikaLogo.png"
            alt="TelkoMedika Logo"
            className="w-28 mb-2"
          />
        </div>
        {/* Right: Form */}
        <div className="md:w-2/3 p-8 relative">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center mt-4 md:mt-0 drop-shadow">
            Selamat Datang <br /> Doctor Portal
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-center mt-2">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-green-600 transition"
            >
              Masuk
            </button>
          </form>
          <div className="text-center mt-6 text-sm">
            Belum Punya akun?{" "}
            <a href="/doctor/register" className="text-blue-600 hover:underline">
              Buat Akun
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
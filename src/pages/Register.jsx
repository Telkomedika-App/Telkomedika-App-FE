import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api/student-auth/register";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate("/"), 1500);
    } else {
      setError(data.message || "Registrasi gagal");
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
            Daftar Akun MyTelkomedika
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Konfirmasi Password</label>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi Password"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">No. HP</label>
              <input
                type="text"
                name="phone"
                placeholder="No. HP"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] shadow"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-center mt-2">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-center mt-2">{success}</div>
            )}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-green-600 transition"
            >
              Daftar
            </button>
          </form>
          <div className="text-center mt-6 text-sm">
            Sudah punya akun?{" "}
            <a href="/" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
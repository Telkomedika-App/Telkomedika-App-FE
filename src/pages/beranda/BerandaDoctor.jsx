import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../utils/constants";

export default function BerandaDoctor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const t = {
    id: {
      title: "Klinik Telkomedika",
      subtitle:
        "Hadir dengan layanan terbaik untuk mendukung praktik dokter dengan sistem reservasi, manajemen janji temu, dan forum diskusi.",
      contact: "Hubungi Kami",
      home: "Beranda",
      articles: "Artikel Kesehatan",
      forum: "Forum Diskusi",
      reservation: "Reservasi",
      logout: "Keluar",
      logoutConfirmTitle: "Konfirmasi Keluar",
      logoutConfirmMessage: "Apakah Anda yakin ingin keluar?",
      logoutConfirmYes: "Ya, Keluar",
      logoutConfirmNo: "Batal",
    },
  };

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

    if (!token || userType !== "doctor") {
      navigate(ROUTES.LOGIN);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("doctorName");
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

    navigate("/login");
  };

  const getInitial = () => {
    const savedName = localStorage.getItem("doctorName");
    if (savedName && savedName.trim().length > 0) {
      return savedName.trim().charAt(0).toUpperCase();
    }
    return "D";
  };

  const getDisplayName = () => {
    const savedName = localStorage.getItem("doctorName");
    if (savedName) {
      return `Dr. ${savedName}`;
    }
    return "Dokter";
  };

  if (loading) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/Background.png")' }}
      >
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const d = t.id;
  const displayName = getDisplayName();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/Background.png")' }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/55"></div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
          {/* LEFT */}
          <Link
            to="/doctor-profile"
            className="flex items-center gap-3 no-underline"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitial()}
            </div>
          </Link>

          {/* MENU */}
          <nav className="flex gap-8 font-medium">
            <Link
              to="/doctor/beranda"
              className="text-yellow-300 underline font-semibold"
            >
              {d.home}
            </Link>
            <Link to={ROUTES.DOCTOR_ARTIKEL} className="hover:text-gray-200">
              {d.articles}
            </Link>
            <Link to="/doctor/forum" className="hover:text-gray-200">
              {d.forum}
            </Link>
            <Link
              to={ROUTES.DOCTOR_APPOINTMENTS}
              className="hover:text-gray-200"
            >
              {d.reservation}
            </Link>
          </nav>

          {/* RIGHT */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            {d.logout}
          </button>
        </header>

        {/* HERO */}
        <section className="px-6 py-24 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            {d.title}
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mt-4 max-w-2xl">
            {d.subtitle}
          </p>

          {/* CONTACT */}
          <a
            href="https://wa.me/6281111500115"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-10 right-10 bg-[#25D366] text-white px-6 py-3 rounded-full flex items-center shadow-xl hover:scale-105 transition"
          >
            <img src="/phone.png" alt="Phone" className="w-5 h-5 mr-2" />
            {d.contact}
          </a>
        </section>

        {/* MODAL LOGOUT */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-2 text-center">
                {d.logoutConfirmTitle}
              </h3>
              <p className="text-gray-700 mb-6 text-center">
                {d.logoutConfirmMessage}
              </p>

              <div className="flex gap-4">
                {/* BATAL - KIRI */}
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  {d.logoutConfirmNo}
                </button>

                {/* YA, KELUAR - KANAN */}
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  {d.logoutConfirmYes}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

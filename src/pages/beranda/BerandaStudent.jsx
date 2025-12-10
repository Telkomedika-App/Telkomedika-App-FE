import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BerandaStudent() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("id");
  const [langPanelVisible, setLangPanelVisible] = useState(false);

  const t = {
    id: {
      title: "Klinik Telkomedika",
      subtitle:
        "Hadir dengan berbagai layanan medis dan didukung oleh tenaga medis profesional yang handal, berpengalaman dan terkualifikasi dengan baik.",
      contact: "Hubungi Kami",
      home: "Beranda",
      articles: "Artikel Kesehatan",
      forum: "Forum Diskusi",
      reservation: "Reservasi",
      logout: "Keluar",
    },
    en: {
      title: "Telkomedika Clinic",
      subtitle:
        "Present with various medical services supported by reliable, experienced medical professionals.",
      contact: "Contact Us",
      home: "Home",
      articles: "Health Articles",
      forum: "Discussion Forum",
      reservation: "Reservation",
      logout: "Logout",
    },
  };

  const d = t[lang];

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/Background.png")' }}>

      {/* ===== HEADER ===== */}
      <header className="topbar dashboard bg-[#7A0C0C] text-white py-3 flex items-center justify-between px-6 shadow-lg">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <img src="/profil.png" alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
        </div>

        {/* MENU */}
        <nav className="menu flex gap-8 font-medium">
          <Link to="/beranda-student" className="menu-item text-yellow-300 underline font-semibold">
            {d.home}
          </Link>
          <Link to="/artikel/student" className="menu-item hover:text-gray-200">
            {d.articles}
          </Link>
          <Link to="/forum" className="menu-item hover:text-gray-200">
            {d.forum}
          </Link>
          <Link to="/student-appointments" className="menu-item hover:text-gray-200">
            {d.reservation}
          </Link>
        </nav>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4">
          <img src="/message.png" className="w-6 h-6 cursor-pointer" />

          {/* LANG BUTTON */}
          <div className="relative">
            <button
              className="p-1"
              onClick={() => setLangPanelVisible(!langPanelVisible)}
            >
              <img src="/globe.png" className="w-6 h-6" />
            </button>

            {langPanelVisible && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg py-2 w-40 z-50">

                <button
                  onClick={() => {
                    setLang("id");
                    setLangPanelVisible(false);
                  }}
                  className="lang-item flex gap-3 px-4 py-2 hover:bg-gray-100 w-full"
                >
                  <img src="/indonesia.png" className="w-5 h-4" />
                  Bahasa
                </button>

                <button
                  onClick={() => {
                    setLang("en");
                    setLangPanelVisible(false);
                  }}
                  className="lang-item flex gap-3 px-4 py-2 hover:bg-gray-100 w-full"
                >
                  <img src="/united states.png" className="w-5 h-4" />
                  English
                </button>

              </div>
            )}
          </div>

          {/* LOGOUT */}
          <button
            onClick={() => navigate("/login")}
            className="chip bg-white text-[#7A0C0C] px-4 py-2 rounded-lg font-semibold"
          >
            {d.logout}
          </button>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="hero px-6 py-24 flex flex-col max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
          {d.title}
        </h1>

        <p className="hero-sub text-lg md:text-xl text-white mt-4 drop-shadow-lg max-w-2xl">
          {d.subtitle}
        </p>

        {/* CONTACT BUTTON */}
        <a
          href="tel:+62000000000"
          className="contact-btn absolute bottom-10 right-10 bg-[#25D366] text-white px-6 py-3 rounded-full flex items-center shadow-xl hover:scale-105 transition"
        >
          <img src="/phone.png" alt="Phone" className="w-5 h-5 mr-2" />
          {d.contact}
        </a>
      </section>

    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BerandaDoctor() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("id");
  const [langPanelVisible, setLangPanelVisible] = useState(false);

  const t = {
    id: {
      title: "Klinik Telkomedika",
      subtitle:
        "Hadir dengan layanan terbaik untuk mendukung praktik dokter dengan sistem reservasi, manajemen janji temu, dan forum diskusi.",
      home: "Beranda",
      articles: "Artikel Kesehatan",
      forum: "Forum Diskusi",
      reservation: "Reservasi",
      contact: "Hubungi Kami",
      logout: "Keluar",
    },
    en: {
      title: "Telkomedika Clinic",
      subtitle:
        "Present with the best services to support doctors with reservations & appointment management.",
      home: "Home",
      articles: "Health Articles",
      forum: "Discussion Forum",
      reservation: "Reservation",
      contact: "Contact Us",
      logout: "Logout",
    },
  };

  const d = t[lang];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/Background.png")' }}
    >

      {/* HEADER */}
      <header className="topbar dashboard bg-[#7A0C0C] text-white py-3 flex items-center justify-between px-6 shadow-lg">

        <div className="flex items-center gap-3">
          <img src="/profil.png" className="w-10 h-10 rounded-full border-2 border-white" />
        </div>

        <nav className="menu flex gap-8 font-medium">
          <Link to="/beranda-doctor" className="menu-item text-yellow-300 underline font-semibold">
            {d.home}
          </Link>
          <Link to="/artikel/doctor" className="menu-item hover:text-gray-200">
            {d.articles}
          </Link>
          <Link to="/doctor/forum" className="menu-item hover:text-gray-200">
            {d.forum}
          </Link>
          <Link to="/doctor-appointments" className="menu-item hover:text-gray-200">
            {d.reservation}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <img src="/message.png" className="w-6 h-6 cursor-pointer" />

          <div className="relative">
            <button onClick={() => setLangPanelVisible(!langPanelVisible)}>
              <img src="/globe.png" className="w-6 h-6" />
            </button>

            {langPanelVisible && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg py-2 w-40">

                <button
                  onClick={() => {
                    setLang("id");
                    setLangPanelVisible(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full"
                >
                  <img src="/indonesia.png" className="w-5 h-4" />
                  Bahasa
                </button>

                <button
                  onClick={() => {
                    setLang("en");
                    setLangPanelVisible(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full"
                >
                  <img src="/united states.png" className="w-5 h-4" />
                  English
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/login")}
            className="chip bg-white text-[#7A0C0C] px-4 py-2 rounded-lg font-semibold"
          >
            {d.logout}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero px-6 py-24 flex flex-col max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
          {d.title}
        </h1>

        <p className="text-lg md:text-xl text-white drop-shadow-lg max-w-2xl mt-4">
          {d.subtitle}
        </p>

        <a
          href="tel:+62000000000"
          className="absolute bottom-10 right-10 bg-[#25D366] text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition"
        >
          <img src="/phone.png" className="w-5 h-5" />
          {d.contact}
        </a>
      </section>
    </div>
  );
}

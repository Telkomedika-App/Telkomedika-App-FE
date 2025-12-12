import React from "react";
import { useNavigate } from "react-router-dom";
import useStudentAppointment from "../../hooks/useStudentAppointment";

export default function StudentAppointment() {
  const navigate = useNavigate();
  const {
    lang,
    langPanelVisible,
    toggleLangPanel,
    changeLanguage,
    form,
    setForm,
    activeReservation,
    countdown,
    translations,
    handleSubmit,
    cancelReservation,
    clearLocalActiveReservation,
    serviceLabel,
    getStatusLabel,
    isActiveReservation,
  } = useStudentAppointment();

  const d = translations[lang];

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: 'url("/background.png")' }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* HEADER */}
      <header className="relative z-10 bg-[#7A0C0C] text-white py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <a href="/student-profile">
              <img
                src="/profil.png"
                alt="Profil"
                className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
          </div>

          <nav className="flex items-center gap-8 font-medium">
            <a href="/" className="hover:text-gray-200 transition-colors">
              {d.navHome}
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors">
              {d.navArticles}
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors">
              {d.navForum}
            </a>
            <a href="/student-appointments" className="text-yellow-300 font-semibold underline">
              {d.navReservation}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-red-800 rounded-lg transition-colors">
              <img src="/message.png" alt="Pesan" className="w-6 h-6" />
            </button>

            <div className="relative">
              <button onClick={toggleLangPanel} className="p-2 hover:bg-red-800 rounded-lg transition-colors">
                <img src="/globe.png" alt="Bahasa" className="w-6 h-6" />
              </button>

              {langPanelVisible && (
                <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-2 min-w-[140px] z-20">
                  <button onClick={() => changeLanguage("id")} className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 transition-colors">
                    <img src="/indonesia.png" alt="ID" className="w-5 h-4" />
                    <span className="text-gray-800">Bahasa</span>
                  </button>
                  <button onClick={() => changeLanguage("en")} className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 transition-colors">
                    <img src="/united states.png" alt="EN" className="w-5 h-4" />
                    <span className="text-gray-800">English</span>
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => navigate("/login")} className="bg-white text-[#7A0C0C] px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              {d.logout}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="relative z-10 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl md:max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-center">{d.title}</h1>
          </div>

          {isActiveReservation() ? (
            <div>
              <div
                className={`reservation-status ${
                  String(activeReservation.status || "").toUpperCase() === "PENDING"
                    ? "status-pending"
                    : String(activeReservation.status || "").toUpperCase() === "CONFIRMED"
                    ? "status-approved"
                    : String(activeReservation.status || "").toUpperCase() === "COMPLETED"
                    ? "status-completed"
                    : "status-cancelled"
                }`}
              >
                {getStatusLabel(activeReservation.status)}
              </div>

              {String(activeReservation.status || "").toUpperCase() === "PENDING" && (
                <div id="pending-section">
                  <p className="text-gray-600 text-center mb-4">
                    Permintaan reservasi Anda sedang menunggu persetujuan dokter.
                  </p>
                  <div className="reservation-details bg-gray-50 p-4 rounded-lg mb-4">
                    <p><strong>{d.labelName}:</strong> {activeReservation.fullName || activeReservation.name}</p>
                    <p><strong>{d.labelPhone}:</strong> {activeReservation.phone}</p>
                    <p><strong>{d.labelService}:</strong> {serviceLabel(activeReservation.service)}</p>
                    <p><strong>{d.labelDate}:</strong> {new Date(activeReservation.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>{d.labelTime}:</strong> {activeReservation.time}</p>
                  </div>
                  <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors" onClick={cancelReservation}>
                    {d.cancelBtn}
                  </button>
                </div>
              )}

              {String(activeReservation.status || "").toUpperCase() === "CONFIRMED" && (
                <div id="countdown-section" className="countdown">
                  <div className="countdown-label">{d.countdownLabel}</div>
                  <div className="countdown-timer">{countdown}</div>

                  <div className="reservation-details bg-gray-50 p-4 rounded-lg mb-4 mt-4">
                    <p><strong>{d.labelName}:</strong> {activeReservation.fullName || activeReservation.name}</p>
                    <p><strong>{d.labelPhone}:</strong> {activeReservation.phone}</p>
                    <p><strong>{d.labelService}:</strong> {serviceLabel(activeReservation.service)}</p>
                    <p><strong>{d.labelDate}:</strong> {new Date(activeReservation.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>{d.labelTime}:</strong> {activeReservation.time}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {lang === "id"
                        ? "Dokter: " + (activeReservation.doctor?.name || "Belum ditentukan")
                        : "Doctor: " + (activeReservation.doctor?.name || "Not assigned")}
                    </p>
                  </div>

                  <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors" onClick={cancelReservation}>
                    {d.cancelBtn}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div id="reservation-form">
              <p className="text-gray-600 text-center mb-6">{d.subtitle}</p>

              <label className="block text-gray-800 font-semibold mb-2">{d.labelName}</label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent"
                placeholder={d.placeholderName}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label className="block text-gray-800 font-semibold mb-2 mt-4">{d.labelPhone}</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent"
                placeholder={d.placeholderPhone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <label className="block text-gray-800 font-semibold mb-2 mt-4">{d.labelDate}</label>
              <input
                id="input-date"
                type="date"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />

              <label className="block text-gray-800 font-semibold mb-2 mt-4">{d.labelTime}</label>
              <input
                type="time"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />

              <label className="block text-gray-800 font-semibold mb-2 mt-4">{d.labelService}</label>
              <select
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:border-transparent"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              >
                <option value="dokter-umum">{d.serviceGeneral}</option>
                <option value="dokter-gigi">{d.serviceDental}</option>
              </select>

              <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-6 hover:bg-green-700 transition-colors" onClick={handleSubmit}>
                {d.submit}
              </button>

              {activeReservation && !isActiveReservation() && (
                <div className="mt-4 p-4 bg-gray-100 rounded-xl text-center">
                  <p className="text-gray-700">
                    {String(activeReservation.status || "").toUpperCase() === "COMPLETED"
                      ? d.appointmentCompleted
                      : d.appointmentCancelled}
                  </p>
                  <button
                    onClick={() => {
                      clearLocalActiveReservation();
                      setForm({
                        name: "",
                        phone: "",
                        date: "",
                        time: "",
                        service: "dokter-umum",
                      });
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {lang === "id" ? "Buat reservasi baru" : "Create new reservation"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .countdown {
          background: #f8f9fa;
          border: 2px solid #7b0d0d;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .countdown-timer {
          font-size: 2.5em;
          font-weight: bold;
          color: #7b0d0d;
          margin: 10px 0;
        }
        .countdown-label {
          color: #6b7280;
          font-size: 1.1em;
        }
        .reservation-status {
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          text-align: center;
          font-weight: bold;
        }
        .status-pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        .status-approved {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        .status-completed {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
}
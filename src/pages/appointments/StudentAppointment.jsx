import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/constants";

export default function StudentAppointment() {
  const navigate = useNavigate();
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");

  const [lang, setLang] = useState("id");
  const [langPanelVisible, setLangPanelVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    service: "dokter-umum",
  });

  const [activeReservation, setActiveReservation] = useState(null);

  const [countdown, setCountdown] = useState("");

  const t = {
    id: {
      title: "Reservasi",
      subtitle: "Silakan lengkapi data reservasi Anda",
      labelName: "Nama Lengkap",
      placeholderName: "Masukkan nama lengkap",
      labelPhone: "No. HP",
      placeholderPhone: "Contoh: 081234567890",
      labelDate: "Tanggal",
      labelTime: "Waktu",
      labelService: "Layanan",
      serviceGeneral: "Layanan Dokter Umum",
      serviceDental: "Layanan Dokter Gigi",
      submit: "Kirim Reservasi",
      logout: "Keluar",
      success: "Reservasi berhasil dikirim dan menunggu persetujuan admin",
      navHome: "Beranda",
      navArticles: "Artikel Kesehatan",
      navForum: "Forum Diskusi",
      navReservation: "Reservasi",
      errFill: "Harap lengkapi semua data",
      statusPending: "Menunggu Persetujuan Admin",
      statusConfirmed: "Reservasi Dikonfirmasi", 
      statusCompleted: "Reservasi Selesai",
      statusCancelled: "Reservasi Dibatalkan",
      countdownLabel: "Menuju waktu reservasi:",
      cancelBtn: "Batalkan Reservasi",
      cancelConfirm:
        "Apakah Anda yakin ingin membatalkan reservasi? Permintaan pembatalan akan dikirim ke admin.",
      cancelSuccess: "Permintaan pembatalan telah dikirim ke admin",
      noReservation: "Tidak ada reservasi aktif",
      alreadyReservation: "Anda sudah memiliki reservasi aktif",
      appointmentCompleted: "Appointment sudah selesai",
      appointmentCancelled: "Appointment sudah dibatalkan",
    },
    en: {
      title: "Reservation",
      subtitle: "Please complete your reservation data",
      labelName: "Full Name",
      placeholderName: "Enter your full name",
      labelPhone: "Phone Number",
      placeholderPhone: "Example: 081234567890",
      labelDate: "Date",
      labelTime: "Time",
      labelService: "Service",
      serviceGeneral: "General Practitioner Service",
      serviceDental: "Dental Service",
      submit: "Submit Reservation",
      logout: "Logout",
      success: "Reservation submitted successfully and waiting for admin approval",
      navHome: "Home",
      navArticles: "Health Articles",
      navForum: "Discussion Forum",
      navReservation: "Reservation",
      errFill: "Please complete all fields",
      statusPending: "Waiting for Admin Approval",
      statusConfirmed: "Reservation Confirmed", 
      statusCompleted: "Reservation Completed",
      statusCancelled: "Reservation Cancelled",
      countdownLabel: "Time until reservation:",
      cancelBtn: "Cancel Reservation",
      cancelConfirm:
        "Are you sure you want to cancel the reservation? Cancellation request will be sent to admin.",
      cancelSuccess: "Cancellation request has been sent to admin",
      noReservation: "No active reservation",
      alreadyReservation: "You already have an active reservation",
      appointmentCompleted: "Appointment completed",
      appointmentCancelled: "Appointment cancelled",
    },
  };

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  // Utility: safe parse and select an "active" reservation from various BE shapes
  function pickActiveReservationFromResponse(data) {
    if (!data) return null;

    if (!Array.isArray(data) && typeof data === "object") {
      const status = String(data.status || "").toUpperCase();
      // Hanya return jika status aktif
      if (["PENDING", "CONFIRMED"].includes(status)) {
        return data;
      }
      return null;
    }

    if (Array.isArray(data)) {
      const active = data
        .filter((a) => a && a.status)
        .sort((a, b) => {
          const ta = new Date(a.date).getTime() || 0;
          const tb = new Date(b.date).getTime() || 0;
          return tb - ta;
        })
        .find((a) => {
          const status = String(a.status).toUpperCase();
          return ["PENDING", "CONFIRMED"].includes(status);
        });
      
      return active || null;
    }

    return null;
  }

  function clearLocalActiveReservation() {
    localStorage.removeItem("activeReservation");
    setActiveReservation(null);
  }

  const fetchReservationData = async () => {
    if (!token) return;

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/my`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 7000,
      });

      const maybeData = res?.data?.data ?? res?.data;

      const picked = pickActiveReservationFromResponse(maybeData);

      if (!picked) {
        clearLocalActiveReservation();
        return;
      }

      let dateOnly = picked.date;
      if (typeof dateOnly === "string" && dateOnly.includes("T")) {
        dateOnly = dateOnly.split("T")[0];
      } else if (picked.date instanceof Date) {
        dateOnly = picked.date.toISOString().split("T")[0];
      }

      const normalized = { ...picked, date: dateOnly };
      const statusUpper = String(normalized.status || "").toUpperCase();

      // Jika status adalah CANCELLED atau COMPLETED, clear dari localStorage
      if (["CANCELLED", "COMPLETED"].includes(statusUpper)) {
        clearLocalActiveReservation();
        return;
      }

      localStorage.setItem("activeReservation", JSON.stringify(normalized));
      setActiveReservation(normalized);
    } catch (err) {
      console.error("Error fetching reservation:", err);
      try {
        const saved = JSON.parse(localStorage.getItem("activeReservation") || "null");
        if (saved) {
          const savedStatus = String(saved.status || "").toUpperCase();
          if (!["CANCELLED", "COMPLETED"].includes(savedStatus)) {
            setActiveReservation(saved);
          }
        }
      } catch (e) {
        setActiveReservation(null);
      }
    }
  };

  // Load active reservation dari backend dan localStorage
  useEffect(() => {
    fetchReservationData();

    // set min date for date input
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("input-date");
    if (dateInput) dateInput.min = today;
  }, [token]);

  useEffect(() => {
    if (!activeReservation) return;

    const interval = setInterval(() => {
      const statusUpper = String(activeReservation.status || "").toUpperCase();
      if (statusUpper === "CONFIRMED") {
        // Cek apakah waktu appointment sudah lewat
        const now = new Date();
        const appointmentDate = activeReservation.date;
        const appointmentTime = activeReservation.time;
        
        if (appointmentDate && appointmentTime) {
          const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
          if (now > appointmentDateTime) {
            fetchReservationData();
          }
        }
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [activeReservation]);

  useEffect(() => {
    if (!activeReservation) {
      setCountdown("");
      return;
    }

    const statusUpper = String(activeReservation.status || "").toUpperCase();
    if (statusUpper !== "CONFIRMED") {
      setCountdown("");
      return;
    }
    const dateStr = activeReservation.date;
    const timeStr = activeReservation.time;
    
    if (!dateStr || !timeStr) {
      setCountdown("");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      
      // Format date properly
      let targetDateStr = dateStr;
      if (targetDateStr.includes("T")) {
        targetDateStr = targetDateStr.split("T")[0];
      }
      
      const target = new Date(`${targetDateStr}T${timeStr}`);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown("00:00:00");
        fetchReservationData(); // Refresh data dari server
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  // Submit reservation
  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) {
      alert(t[lang].errFill);
      return;
    }

    // Cek apakah sudah ada appointment aktif
    if (activeReservation) {
      const statusUpper = String(activeReservation.status || "").toUpperCase();
      if (["PENDING", "CONFIRMED"].includes(statusUpper)) {
        alert(t[lang].alreadyReservation);
        return;
      }
    }

    try {
      // Mapping service ke format backend
      let serviceCode;
      if (form.service === "dokter-umum") {
        serviceCode = "general";
      } else if (form.service === "dokter-gigi") {
        serviceCode = "dental";
      } else {
        serviceCode = "general";
      }

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}`,
        {
          fullName: form.name,
          phone: form.phone,
          date: form.date,
          time: form.time,
          service: serviceCode,
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          },
        }
      );

      if (!res?.data?.success) {
        alert(res?.data?.message || "Gagal membuat reservasi.");
        return;
      }

      const newData = res.data.data || {};
      const dateOnly = typeof newData.date === "string" && newData.date.includes("T")
        ? newData.date.split("T")[0]
        : newData.date || form.date;

      const newReservation = { ...newData, date: dateOnly };

      // Simpan ke localStorage
      localStorage.setItem("activeReservation", JSON.stringify(newReservation));
      setActiveReservation(newReservation);

      // Reset form
      setForm({
        name: "",
        phone: "",
        date: "",
        time: "",
        service: "dokter-umum",
      });

      alert(t[lang].success);
    } catch (err) {
      console.error("Create appointment failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Gagal membuat reservasi.");
    }
  };

  // Cancel reservation
  const cancelReservation = async () => {
    if (!activeReservation) return;
    
    if (!window.confirm(t[lang].cancelConfirm)) return;

    const id = activeReservation.id || activeReservation._id || null;

    if (id) {
      try {
        const url = `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/${id}/cancel`;
        const res = await axios.post(
          url, 
          {}, 
          { 
            headers: { Authorization: `Bearer ${token}` } 
          }
        );

        if (res?.data?.success) {
          // Update local state ke CANCELLED
          const updated = { ...activeReservation, status: "CANCELLED" };
          localStorage.setItem("activeReservation", JSON.stringify(updated));
          setActiveReservation(updated);
          alert(t[lang].cancelSuccess);
        } else {
          alert(res?.data?.message || "Gagal membatalkan reservasi.");
        }
      } catch (err) {
        console.error("Cancel failed:", err);
        alert(err?.response?.data?.message || "Gagal membatalkan reservasi.");
      }
    } else {
      alert("ID appointment tidak ditemukan.");
    }
  };

  const toggleLangPanel = (e) => {
    e.stopPropagation();
    setLangPanelVisible(!langPanelVisible);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    setLangPanelVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setLangPanelVisible(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const d = t[lang];

  const serviceLabel = (svc) => {
    const safeSvc = String(svc || "").toLowerCase();
    if (safeSvc === "general" || safeSvc === "dokter-umum") return d.serviceGeneral;
    if (safeSvc === "dental" || safeSvc === "dokter-gigi") return d.serviceDental;
    return d.serviceGeneral;
  };

  const getStatusLabel = (status) => {
    const safeStatus = String(status || "").toUpperCase();
    if (safeStatus === "PENDING") return d.statusPending;
    if (safeStatus === "CONFIRMED") return d.statusConfirmed;
    if (safeStatus === "COMPLETED") return d.statusCompleted;
    if (safeStatus === "CANCELLED") return d.statusCancelled;
    return d.statusPending;
  };

  const isActiveReservation = () => {
    if (!activeReservation) return false;
    const statusUpper = String(activeReservation.status || "").toUpperCase();
    return ["PENDING", "CONFIRMED"].includes(statusUpper);
  };

  const handleRefresh = () => {
    fetchReservationData();
  };

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
            <img
              src="/profil.png"
              alt="Profil"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
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
            <button 
              onClick={handleRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {lang === "id" ? "Refresh" : "Refresh"}
            </button>
          </div>

          {isActiveReservation() ? (
            <div>
              {/* STATUS BADGE */}
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

              {/* PENDING Section */}
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

              {/* CONFIRMED with Countdown */}
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

              {/* Tampilkan info jika ada appointment yang sudah selesai/dibatalkan */}
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
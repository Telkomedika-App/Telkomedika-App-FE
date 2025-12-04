import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAPI } from "../../api/client";
import { LOCAL_STORAGE_KEYS, API_ENDPOINTS } from "../../utils/constants";

const translations = {
  id: {
    title: "Reservasi Dokter",
    labelName: "Nama Lengkap",
    labelPhone: "No. HP",
    labelService: "Layanan",
    labelDate: "Tanggal",
    labelTime: "Waktu",
    countdownLabel: "Menuju waktu reservasi:",
    cancelBtn: "Batalkan Reservasi",
    navHome: "Beranda",
    navArticles: "Artikel Kesehatan",
    navForum: "Forum Diskusi",
    navReservation: "Reservasi",
    logout: "Keluar",
    approve: "Setujui",
    cancel: "Batalkan",
    appointmentList: "Daftar Appointment",
    appointmentDetail: "Detail Appointment",
  },
  en: {
    title: "Doctor Reservations",
    labelName: "Full Name",
    labelPhone: "Phone Number",
    labelService: "Service",
    labelDate: "Date",
    labelTime: "Time",
    countdownLabel: "Time until reservation:",
    cancelBtn: "Cancel Reservation",
    navHome: "Home",
    navArticles: "Health Articles",
    navForum: "Discussion Forum",
    navReservation: "Reservation",
    logout: "Logout",
    approve: "Approve",
    cancel: "Cancel",
    appointmentList: "Appointment List",
    appointmentDetail: "Appointment Detail",
  },
};

export default function DoctorAppointment() {
  const [lang, setLang] = useState("id");
  const [langPanelVisible, setLangPanelVisible] = useState(false);
  const t = translations[lang];

  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const loadAppointments = async () => {
    try {
      const res = await fetchAPI(API_ENDPOINTS.APPOINTMENTS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
    }
  };

  useEffect(() => {
    if (!selected || selected.status !== "CONFIRMED") return;

    const interval = setInterval(() => {
      const now = new Date();
      const dateObj = new Date(selected.date);
      const timeStr = selected.time;
      const target = new Date(`${dateObj.toISOString().split("T")[0]}T${timeStr}`);

      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);

        const updated = { ...selected, status: "COMPLETED" };
        setSelected(updated);
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setCountdown(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    loadAppointments();
  }, []);

  // Approve appointment
  const approve = async (id) => {
    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.success) {
        await loadAppointments();
        alert(lang === "id" ? "Appointment disetujui!" : "Appointment approved!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (id) => {
    if (!window.confirm(t.cancelBtn)) return;

    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.success) {
        await loadAppointments();
        alert(lang === "id" ? "Appointment dibatalkan." : "Appointment cancelled.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change status (doctor)
  const changeStatus = async (id, status) => {
    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: status.toLowerCase() }),
      });

      if (!res || res.success !== true) {
        alert(res?.message || (lang === "id" ? "Gagal mengubah status." : "Update status failed."));
        return;
      }

      // Reload updated appointment
      const fresh = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = fresh?.data || selected;
      setSelected(updated);
      setAppointments((arr) => arr.map((a) => (a.id === id ? updated : a)));
      alert(lang === "id" ? "Status diubah." : "Status updated.");
    } catch (err) {
      console.error(err);
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
    const handleClickOutside = () => {
      setLangPanelVisible(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: 'url("/background.png")' }}>
      <div className="absolute inset-0 bg-black/40" />

      <header className="relative z-10 bg-[#7A0C0C] text-white py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/profil.png" alt="Profil" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
          </div>

          <nav className="flex items-center gap-8 font-medium">
            <a href="/" className="hover:text-gray-200 transition-colors">{t.navHome}</a>
            <a href="#" className="hover:text-gray-200 transition-colors">{t.navArticles}</a>
            <a href="#" className="hover:text-gray-200 transition-colors">{t.navForum}</a>
            <a href="/doctor-appointments" className="text-yellow-300 font-semibold underline">{t.navReservation}</a>
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
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">{t.title}</h1>

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{t.appointmentList}</h2>

          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-2 border-gray-200 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 hover:border-[#7A0C0C] transition-all"
                  onClick={() => { setSelected(item); setSelectedStatus(item.status); }}
                >
                  <p className="font-bold text-lg text-gray-800">{item.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.service === "dokter-umum" 
                      ? (lang === "id" ? "Layanan Dokter Umum" : "General Practitioner Service")
                      : (lang === "id" ? "Layanan Dokter Gigi" : "Dental Service")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US")} • {item.time}
                  </p>

                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                    item.status === "PENDING"
                      ? "bg-yellow-200 text-yellow-900"
                      : item.status === "CONFIRMED"
                      ? "bg-blue-200 text-blue-900"
                      : item.status === "CANCELLED"
                      ? "bg-red-200 text-red-900"
                      : "bg-green-200 text-green-900"
                  }`}>
                    {item.status === "PENDING"
                      ? (lang === "id" ? "MENUNGGU" : "PENDING")
                      : item.status === "CONFIRMED"
                      ? (lang === "id" ? "DISETUJUI" : "CONFIRMED")
                      : item.status === "CANCELLED"
                      ? (lang === "id" ? "DIBATALKAN" : "CANCELLED")
                      : (lang === "id" ? "SELESAI" : "COMPLETED")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">{lang === "id" ? "Tidak ada appointment" : "No appointments"}</div>
            )}
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{t.appointmentDetail}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold text-gray-700">{t.labelName}</p>
                <p className="text-gray-900">{selected.fullName}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{t.labelPhone}</p>
                <p className="text-gray-900">{selected.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{t.labelService}</p>
                <p className="text-gray-900">{selected.service === "dokter-umum" 
                    ? (lang === "id" ? "Layanan Dokter Umum" : "General Practitioner Service")
                    : (lang === "id" ? "Layanan Dokter Gigi" : "Dental Service")}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{t.labelDate}</p>
                <p className="text-gray-900">
                  {new Date(selected.date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{t.labelTime}</p>
                <p className="text-gray-900">{selected.time}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{lang === "id" ? "Status" : "Status"}</p>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    selected.status === "PENDING"
                      ? "bg-yellow-200 text-yellow-900"
                      : selected.status === "CONFIRMED"
                      ? "bg-blue-200 text-blue-900"
                      : selected.status === "CANCELLED"
                      ? "bg-red-200 text-red-900"
                      : "bg-green-200 text-green-900"
                  }`}>
                  {selected.status === "PENDING"
                    ? (lang === "id" ? "MENUNGGU" : "PENDING")
                    : selected.status === "CONFIRMED"
                    ? (lang === "id" ? "DISETUJUI" : "CONFIRMED")
                    : selected.status === "CANCELLED"
                    ? (lang === "id" ? "DIBATALKAN" : "CANCELLED")
                    : (lang === "id" ? "SELESAI" : "COMPLETED")}
                </span>
              </div>
            </div>

            {selected.status === "CONFIRMED" && (
              <div className="mt-4 p-6 bg-gray-100 rounded-2xl text-center border-2 border-[#7A0C0C]">
                <p className="font-semibold text-gray-700 text-lg">{t.countdownLabel}</p>
                <p className="text-4xl font-bold mt-2 text-[#7A0C0C]">{countdown}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6 flex-wrap">
              {selected.status === "PENDING" && (
                <>
                  <button
                    onClick={() => approve(selected.id)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
                  >
                    {t.approve}
                  </button>

                  <button
                    onClick={() => cancelAppointment(selected.id)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                  >
                    {t.cancel}
                  </button>
                </>
              )}

              {(selected.status === "CONFIRMED" || selected.status === "COMPLETED") && (
                <button
                  onClick={() => cancelAppointment(selected.id)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  {t.cancelBtn}
                </button>
              )}

              <div className="flex-1">
                <select
                  className="w-full px-3 py-2 border rounded-xl"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <button
                onClick={() => changeStatus(selected.id, selectedStatus)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                {lang === "id" ? "Ubah Status" : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

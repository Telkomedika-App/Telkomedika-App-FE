import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../../api/client";
import { LOCAL_STORAGE_KEYS, API_ENDPOINTS } from "../../utils/constants";
import { jwtDecode } from "jwt-decode";

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
    logoutConfirmTitle: "Konfirmasi Keluar",
    logoutConfirmMessage: "Apakah Anda yakin ingin keluar dari akun Anda?",
    logoutCancel: "Batal",
    logoutConfirm: "Ya, Keluar",
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
    logoutConfirmTitle: "Confirm Logout",
    logoutConfirmMessage: "Are you sure you want to logout from your account?",
    logoutCancel: "Cancel",
    logoutConfirm: "Logout",
  },
};

export default function DoctorAppointment() {
  const [lang, setLang] = useState("id");
  const t = translations[lang];

  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [doctorData, setDoctorData] = useState(null);

  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  useEffect(() => {
    const storedDoctorData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);
    if (storedDoctorData) {
      try {
        setDoctorData(JSON.parse(storedDoctorData));
      } catch (error) {
        console.error("Error parsing doctor data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const ensureDoctorProfile = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem("authToken") || localStorage.getItem("token");
        if (token && !localStorage.getItem("doctorName")) {
          try {
            const decoded = jwtDecode(token);
            const nameFromToken = decoded?.name || decoded?.fullName || decoded?.username || "";
            if (nameFromToken) {
              localStorage.setItem("doctorName", nameFromToken);
            }
          } catch (_) {}
        }
        if (!doctorData) {
          const res = await fetchAPI("/doctor-profile", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (res?.success && res?.data) {
            setDoctorData(res.data);
            const name = res.data.name || res.data.fullName || "";
            if (name) {
              localStorage.setItem("doctorName", name);
            }
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(res.data));
          }
        }
      } catch (e) {
        // silent
      }
    };
    ensureDoctorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitial = () => {
    const name =
      doctorData?.name ||
      doctorData?.fullName ||
      (localStorage.getItem("doctorName") || "").trim() ||
      (() => {
        try {
          const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem("authToken") || localStorage.getItem("token");
          if (!token) return "";
          const decoded = jwtDecode(token);
          return decoded?.name || decoded?.fullName || decoded?.username || "";
        } catch {
          return "";
        }
      })();
    if (name) return name.charAt(0).toUpperCase();
    return "D";
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    localStorage.removeItem("activeReservation");
    localStorage.removeItem("lastShownCancellationId");

    navigate("/login");
    setLogoutModalVisible(false);
  };

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

  const approve = async (id) => {
    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success) {
        await loadAppointments();
        alert(lang === "id" ? "Appointment disetujui!" : "Appointment approved!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm(t.cancelBtn)) return;

    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.success) {
        await loadAppointments();
        alert(lang === "id" ? "Appointment dibatalkan." : "Appointment cancelled.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });

      if (!res || res.success !== true) {
        alert(res?.message || (lang === "id" ? "Gagal mengubah status." : "Update status failed."));
        return;
      }

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

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: 'url("/background.png")' }}>
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal Konfirmasi Logout */}
      {logoutModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold mb-3">
              Konfirmasi Keluar
            </h2>

            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setLogoutModalVisible(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Batal
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER*/}
      <header
        className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg fixed top-0 left-0 right-0 z-50"
        style={{ pointerEvents: 'auto' }}
      >

        {/*Profil*/}
        <Link
          to="/doctor-profile"
          className="flex items-center gap-3 no-underline hover:opacity-90 transition-opacity"
        >
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg"
          >
            {getInitial()}
          </div>
        </Link>

        {/* MENU */}
        <nav className="flex gap-8 font-medium">
          <Link
            to="/beranda-doctor"
            className="hover:text-gray-200 transition-colors"
          >
            {t.navHome}
          </Link>
          <Link
            to="/artikel/doctor"
            className="hover:text-gray-200 transition-colors"
          >
            {t.navArticles}
          </Link>
          <Link
            to="/doctor/forum"
            className="hover:text-gray-200 transition-colors"
          >
            {t.navForum}
          </Link>
          <div className="text-yellow-300 underline font-semibold" style={{ cursor: 'default' }}>
            {t.navReservation}
          </div>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            {t.logout}
          </button>
        </div>
      </header>
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">{t.title}</h1>

        {/* Appointment List */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{t.appointmentList}</h2>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-2 border-gray-200 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 hover:border-[#7A0C0C] transition-all"
                  onClick={() => {
                    setSelected(item);
                    setSelectedStatus(item.status);
                  }}
                >
                  <p className="font-bold text-lg text-gray-800">{item.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.service === "dokter-umum" ? (lang === "id" ? "Layanan Dokter Umum" : "General Practitioner Service") : (lang === "id" ? "Layanan Dokter Gigi" : "Dental Service")}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US")} • {item.time}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${item.status === "PENDING" ? "bg-yellow-200 text-yellow-900"
                      : item.status === "CONFIRMED" ? "bg-blue-200 text-blue-900"
                        : item.status === "CANCELLED" ? "bg-red-200 text-red-900"
                          : "bg-green-200 text-green-900"}`}>
                    {item.status === "PENDING" ? (lang === "id" ? "MENUNGGU" : "PENDING")
                      : item.status === "CONFIRMED" ? (lang === "id" ? "DISETUJUI" : "CONFIRMED")
                        : item.status === "CANCELLED" ? (lang === "id" ? "DIBATALKAN" : "CANCELLED")
                          : (lang === "id" ? "SELESAI" : "COMPLETED")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">{lang === "id" ? "Tidak ada appointment" : "No appointments"}</div>
            )}
          </div>
        </div>

        {/* Appointment Detail */}
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
                <p className="text-gray-900">
                  {selected.service === "dokter-umum" ? (lang === "id" ? "Layanan Dokter Umum" : "General Practitioner Service") : (lang === "id" ? "Layanan Dokter Gigi" : "Dental Service")}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{t.labelDate}</p>
                <p className="text-gray-900">
                  {new Date(selected.date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{t.labelTime}</p>
                <p className="text-gray-900">{selected.time}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{lang === "id" ? "Status" : "Status"}</p>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${selected.status === "PENDING" ? "bg-yellow-200 text-yellow-900"
                    : selected.status === "CONFIRMED" ? "bg-blue-200 text-blue-900"
                      : selected.status === "CANCELLED" ? "bg-red-200 text-red-900"
                        : "bg-green-200 text-green-900"}`}>
                  {selected.status === "PENDING" ? (lang === "id" ? "MENUNGGU" : "PENDING")
                    : selected.status === "CONFIRMED" ? (lang === "id" ? "DISETUJUI" : "CONFIRMED")
                      : selected.status === "CANCELLED" ? (lang === "id" ? "DIBATALKAN" : "CANCELLED")
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

            {/* Tombol untuk approve/cancel hehe*/}
            {selected.status === "PENDING" && (
              <div className="flex gap-3 mt-4">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

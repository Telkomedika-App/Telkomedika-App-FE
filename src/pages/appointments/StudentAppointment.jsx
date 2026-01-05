import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS, LOCAL_STORAGE_KEYS } from "../../utils/constants";

export default function StudentAppointment() {
  const navigate = useNavigate();
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

  const [userData, setUserData] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    service: "dokter-umum",
  });

  const [activeReservation, setActiveReservation] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [countdown, setCountdown] = useState("");
  const [cancelledNoticeVisible, setCancelledNoticeVisible] = useState(false);
  const [adminCancelledNoticeVisible, setAdminCancelledNoticeVisible] = useState(false);
  const [adminCancelledData, setAdminCancelledData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const getInitial = () => {
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    if (userData?.fullName) {
      return userData.fullName.charAt(0).toUpperCase();
    }
    return "M";
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
      cancelConfirm: "Apakah Anda yakin ingin membatalkan reservasi? Permintaan pembatalan akan dikirim ke admin.",
      cancelSuccess: "Permintaan pembatalan telah dikirim ke admin",
      noReservation: "Tidak ada reservasi aktif",
      alreadyReservation: "Anda sudah memiliki reservasi aktif",
      appointmentCompleted: "Appointment sudah selesai",
      appointmentCancelled: "Appointment sudah dibatalkan",
      adminCancelledTitle: "Reservasi Dibatalkan",
      adminCancelledMessage: "Admin telah membatalkan reservasi Anda.",
      adminCancelledDetails: "Detail Reservasi Dibatalkan:",
      adminCancelledReason: "Alasan Pembatalan:",
      adminCancelledOK: "OK",
      logoutConfirmTitle: "Konfirmasi Keluar",
      logoutConfirmMessage: "Apakah Anda yakin ingin keluar dari akun Anda?",
      logoutCancel: "Batal",
      logoutConfirm: "Ya, Keluar",
    },
  };

  useEffect(() => {
    document.documentElement.setAttribute("lang", "id");
  }, []);

  function pickActiveReservationFromResponse(data) {
    if (!data) return null;

    if (!Array.isArray(data) && typeof data === "object") {
      const status = String(data.status || "").toUpperCase();
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

  function checkForAdminCancellation(data) {
    if (!data) return null;
    
    if (Array.isArray(data)) {
      const cancelledReservations = data
        .filter((a) => a && a.status)
        .filter((a) => {
          const status = String(a.status || "").toUpperCase();
          return status === "CANCELLED";
        })
        .sort((a, b) => {
          const ta = new Date(a.updatedAt || a.date).getTime() || 0;
          const tb = new Date(b.updatedAt || b.date).getTime() || 0;
          return tb - ta; 
        });

      if (cancelledReservations.length > 0) {
        const latestCancelled = cancelledReservations[0];
     
        const lastShownCancellation = localStorage.getItem("lastShownCancellationId");
        if (lastShownCancellation === latestCancelled.id || lastShownCancellation === latestCancelled._id) {
          return null;
        }
 
        if (latestCancelled.id) {
          localStorage.setItem("lastShownCancellationId", latestCancelled.id);
        } else if (latestCancelled._id) {
          localStorage.setItem("lastShownCancellationId", latestCancelled._id);
        }
        
        return latestCancelled;
      }
    }
    
    if (!Array.isArray(data) && typeof data === "object") {
      const status = String(data.status || "").toUpperCase();
      if (status === "CANCELLED") {
        const lastShownCancellation = localStorage.getItem("lastShownCancellationId");
        const currentId = data.id || data._id;
        if (lastShownCancellation === currentId) {
          return null;
        }
        
        if (currentId) {
          localStorage.setItem("lastShownCancellationId", currentId);
        }
        
        return data;
      }
    }

    return null;
  }

  function checkForCompletedOrCancelled(data) {
    if (!data) return null;
    
    if (Array.isArray(data)) {
      const completedOrCancelled = data
        .filter((a) => a && a.status)
        .filter((a) => {
          const status = String(a.status || "").toUpperCase();
          return ["COMPLETED", "CANCELLED"].includes(status);
        })
        .sort((a, b) => {
          const ta = new Date(a.updatedAt || a.date).getTime() || 0;
          const tb = new Date(b.updatedAt || b.date).getTime() || 0;
          return tb - ta;
        });

      return completedOrCancelled.length > 0 ? completedOrCancelled[0] : null;
    }
    
    if (!Array.isArray(data) && typeof data === "object") {
      const status = String(data.status || "").toUpperCase();
      if (["COMPLETED", "CANCELLED"].includes(status)) {
        return data;
      }
    }
    
    return null;
  }

  const fetchReservationData = async (showNotification = true) => {
    if (!token) return;

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/my`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 7000,
      });

      const maybeData = res?.data?.data ?? res?.data;

      if (showNotification) {
        const adminCancelledReservation = checkForAdminCancellation(maybeData);
        if (adminCancelledReservation) {
          setAdminCancelledData(adminCancelledReservation);
          setAdminCancelledNoticeVisible(true);
          clearLocalActiveReservation();
        }
      }

      const picked = pickActiveReservationFromResponse(maybeData);

      if (!picked) {
        const saved = JSON.parse(localStorage.getItem("activeReservation") || "null");
        
        if (saved) {
          const savedStatus = String(saved.status || "").toUpperCase();
          
          if (["PENDING", "CONFIRMED"].includes(savedStatus)) {
            const completedOrCancelled = checkForCompletedOrCancelled(maybeData);
            
            if (completedOrCancelled) {
              localStorage.setItem("activeReservation", JSON.stringify(completedOrCancelled));
              setActiveReservation(completedOrCancelled);
              
              const status = String(completedOrCancelled.status || "").toUpperCase();
              if (status === "CANCELLED" && showNotification) {
                const lastShown = localStorage.getItem("lastShownCancellationId");
                const currentId = completedOrCancelled.id || completedOrCancelled._id;
                
                if (lastShown !== currentId) {
                  setAdminCancelledData(completedOrCancelled);
                  setAdminCancelledNoticeVisible(true);
                  if (currentId) {
                    localStorage.setItem("lastShownCancellationId", currentId);
                  }
                }
              }
            } else {
              clearLocalActiveReservation();
            }
          } else {
            setActiveReservation(saved);
          }
        } else {
          clearLocalActiveReservation();
        }
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

      localStorage.setItem("activeReservation", JSON.stringify(normalized));
      setActiveReservation(normalized);

    } catch (err) {
      console.error("Error fetching reservation:", err);
      try {
        const saved = JSON.parse(localStorage.getItem("activeReservation") || "null");
        if (saved) {
          const savedStatus = String(saved.status || "").toUpperCase();
          setActiveReservation(saved);
        }
      } catch (e) {
        setActiveReservation(null);
      }
    } finally {
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    if (!initialLoadDone) {
      fetchReservationData();
    }

    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("input-date");
    if (dateInput) dateInput.min = today;
  }, [token, initialLoadDone]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchReservationData(false); 
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!activeReservation) return;

    const statusUpper = String(activeReservation.status || "").toUpperCase();
    if (statusUpper === "CONFIRMED") {
      const interval = setInterval(() => {
        const now = new Date();
        const appointmentDate = activeReservation.date;
        const appointmentTime = activeReservation.time;
        
        if (appointmentDate && appointmentTime) {
          const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
          if (now > appointmentDateTime) {
            fetchReservationData(false);
          }
        }
      }, 30000); 

      return () => clearInterval(interval);
    }
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
      
      let targetDateStr = dateStr;
      if (targetDateStr.includes("T")) {
        targetDateStr = targetDateStr.split("T")[0];
      }
      
      const target = new Date(`${targetDateStr}T${timeStr}`);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown("00:00:00");
        fetchReservationData(false);
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
      alert(t.id.errFill);
      return;
    }

    if (activeReservation) {
      const statusUpper = String(activeReservation.status || "").toUpperCase();
      if (["PENDING", "CONFIRMED"].includes(statusUpper)) {
        alert(t.id.alreadyReservation);
        return;
      }
    }

    try {
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

      localStorage.setItem("activeReservation", JSON.stringify(newReservation));
      setActiveReservation(newReservation);

      setForm({
        name: "",
        phone: "",
        date: "",
        time: "",
        service: "dokter-umum",
      });

      localStorage.removeItem("lastShownCancellationId");

      alert(t.id.success);
    } catch (err) {
      console.error("Create appointment failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Gagal membuat reservasi.");
    }
  };

  const cancelReservation = async () => {
    if (!activeReservation) return;
    
    if (!window.confirm(t.id.cancelConfirm)) return;

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
          const updated = { ...activeReservation, status: "CANCELLED" };
          localStorage.setItem("activeReservation", JSON.stringify(updated));
          setActiveReservation(updated);
          setCancelledNoticeVisible(true);
          alert(t.id.cancelSuccess);
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

  const d = t.id;

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
    fetchReservationData(true);
  };

  const handleCloseAdminCancelledModal = () => {
    setAdminCancelledNoticeVisible(false);
    setAdminCancelledData(null);
    
    if (activeReservation) {
      const statusUpper = String(activeReservation.status || "").toUpperCase();
      if (statusUpper === "CANCELLED") {
        setForm({
          name: "",
          phone: "",
          date: "",
          time: "",
          service: "dokter-umum",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      setInitialLoadDone(false);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: 'url("/background.png")' }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal untuk reservasi dibatalkan oleh user */}
      {cancelledNoticeVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Reservasi Dibatalkan</h3>
            <p className="text-gray-700 mb-4">Reservasi telah dibatalkan</p>
            <button
              onClick={() => {
                setCancelledNoticeVisible(false);
                clearLocalActiveReservation();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal untuk pembatalan oleh admin */}
      {adminCancelledNoticeVisible && adminCancelledData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-2 text-red-600">{d.adminCancelledTitle}</h3>
            <p className="text-gray-700 mb-4">{d.adminCancelledMessage}</p>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2">{d.adminCancelledDetails}</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>{d.labelName}:</strong> {adminCancelledData.fullName || adminCancelledData.name}</p>
                <p><strong>{d.labelService}:</strong> {serviceLabel(adminCancelledData.service)}</p>
                <p><strong>{d.labelDate}:</strong> {adminCancelledData.date ? new Date(adminCancelledData.date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>{d.labelTime}:</strong> {adminCancelledData.time || 'N/A'}</p>
                {adminCancelledData.cancellationReason && (
                  <p className="mt-2"><strong>{d.adminCancelledReason}</strong> {adminCancelledData.cancellationReason}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCloseAdminCancelledModal}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {d.adminCancelledOK}
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Logout */}
{/* Modal Konfirmasi Logout */}
{logoutModalVisible && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
      
      <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">
        {d.logoutConfirmTitle}
      </h3>

      <p className="text-gray-600 mb-6 text-center">
        {d.logoutConfirmMessage}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => setLogoutModalVisible(false)}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          {d.logoutCancel}
        </button>

        <button
          onClick={confirmLogout}
          className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          {d.logoutConfirm}
        </button>
      </div>

    </div>
  </div>
)}


    {/* HEADER*/}
<header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg relative z-50">
  
  {/*Profil */}
  <Link 
    to="/student-profile" 
    className="flex items-center gap-3 no-underline"
    style={{ 
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer'
    }}
  >
    <div 
      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg"
      style={{ border: 'none' }}
    >
      {getInitial()}
    </div>
  </Link>

  {/* MENU */}
  <nav className="flex gap-8 font-medium">
    <Link 
      to="/beranda-student" 
      className="hover:text-gray-200 transition-colors"
      style={{ 
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer'
      }}
    >
      {d.navHome}
    </Link>
    <Link 
      to="/artikel/student" 
      className="hover:text-gray-200 transition-colors"
      style={{ 
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer'
      }}
    >
      {d.navArticles}
    </Link>
    <Link 
      to="/forum" 
      className="hover:text-gray-200 transition-colors"
      style={{ 
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer'
      }}
    >
      {d.navForum}
    </Link>
    <div className="text-yellow-300 underline font-semibold">
      {d.navReservation}
    </div>
  </nav>

  {/* RIGHT */}
  <div className="flex items-center gap-4">
    <button
      onClick={handleLogout}
      className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg cursor-pointer"
    >
      {d.logout}
    </button>
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
              Refresh
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
                      Dokter: {activeReservation.doctor?.name || "Belum ditentukan"}
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
                    Buat reservasi baru
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CSS Styles */}
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

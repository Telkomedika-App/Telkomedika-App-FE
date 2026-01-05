import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAPI } from "../../api/client";
import { LOCAL_STORAGE_KEYS, API_ENDPOINTS } from "../../utils/constants";

export default function StudentAppointmentStatus() {
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [countdown, setCountdown] = useState("");
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  const navigate = useNavigate();
  
  // Fetch active appointment
  const fetchActiveAppointment = async () => {
    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.success && res.data) {
        setActiveAppointment(res.data);
      } else {
        setActiveAppointment(null);
      }
    } catch (error) {
      console.error("Error fetching active appointment:", error);
      setActiveAppointment(null);
    }
  };
  
  useEffect(() => {
    fetchActiveAppointment();
  }, []);
  
  // Countdown logic untuk CONFIRMED appointment
  useEffect(() => {
    if (!activeAppointment || activeAppointment.status !== "CONFIRMED") return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const dateObj = new Date(activeAppointment.date);
      const timeStr = activeAppointment.time;
      const target = new Date(`${dateObj.toISOString().split("T")[0]}T${timeStr}`);
      
      const diff = target - now;
      
      if (diff <= 0) {
        clearInterval(interval);
        // Auto update status ke COMPLETED
        setActiveAppointment(prev => ({ ...prev, status: "COMPLETED" }));
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeAppointment]);
  
  // Function untuk cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan appointment ini?")) return;
    
    try {
      const res = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.success) {
        alert("Appointment berhasil dibatalkan");
        fetchActiveAppointment(); 
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Gagal membatalkan appointment");
    }
  };

  const handleRefresh = () => {
    fetchActiveAppointment();
  };
  
  if (!activeAppointment) {
    return null; 
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Appointment Aktif Anda</h2>
        <button 
          onClick={handleRefresh}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh Status
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Nama</p>
          <p className="font-semibold">{activeAppointment.fullName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Telepon</p>
          <p className="font-semibold">{activeAppointment.phone}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Layanan</p>
          <p className="font-semibold">
            {activeAppointment.service === "general" ? "Dokter Umum" : "Dokter Gigi"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Dokter</p>
          <p className="font-semibold">
            {activeAppointment.doctor?.name || "Belum ditentukan"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tanggal</p>
          <p className="font-semibold">
            {new Date(activeAppointment.date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Waktu</p>
          <p className="font-semibold">{activeAppointment.time}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            activeAppointment.status === "PENDING" 
              ? "bg-yellow-100 text-yellow-800"
              : activeAppointment.status === "CONFIRMED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {activeAppointment.status === "PENDING" && "MENUNGGU KONFIRMASI"}
            {activeAppointment.status === "CONFIRMED" && "TERKONFIRMASI"}
            {activeAppointment.status === "COMPLETED" && "SELESAI"}
            {activeAppointment.status === "CANCELLED" && "DIBATALKAN"}
          </span>
        </div>
        
        {(activeAppointment.status === "PENDING" || activeAppointment.status === "CONFIRMED") && (
          <button
            onClick={() => handleCancel(activeAppointment.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Batalkan Appointment
          </button>
        )}
      </div>
      
      {/* COUNTDOWN untuk CONFIRMED appointment */}
      {activeAppointment.status === "CONFIRMED" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <p className="text-center text-lg font-semibold text-blue-800 mb-2">
            ⏳ Waktu Menuju Appointment:
          </p>
          <p className="text-center text-3xl font-bold text-blue-600">
            {countdown}
          </p>
          <p className="text-center text-sm text-blue-600 mt-2">
            Pastikan Anda datang tepat waktu!
          </p>
        </div>
      )}
      
      {/* Pesan untuk COMPLETED */}
      {activeAppointment.status === "COMPLETED" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-700 mb-2">Appointment ini sudah selesai.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cek Status Terbaru
          </button>
        </div>
      )}

      {/* Pesan untuk CANCELLED dengan tombol OK kembali ke form reservasi */}
      {activeAppointment.status === "CANCELLED" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-700 mb-4">Reservasi telah dibatalkan</p>
          <button
            onClick={() => navigate("/student-appointments")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}

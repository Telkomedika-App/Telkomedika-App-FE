import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LOCAL_STORAGE_KEYS, API_ENDPOINTS, ROUTES } from "../../utils/constants";
import { fetchAPI } from "../../api/client";

function getStudentNameFromToken() {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.name || "Student";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "Student";
    }
  }
  return "Student";
}

export default function StudentAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [studentName] = useState(() => getStudentNameFromToken());
  const [newAppointment, setNewAppointment] = useState({
    doctor_id: "",
    date: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await fetchAPI(API_ENDPOINTS.STUDENT_APPOINTMENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await fetchAPI(API_ENDPOINTS.APPOINTMENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setDoctors(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_TYPE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const dateObj = new Date(`${newAppointment.date}:00`);
    const isoDate = dateObj.toISOString();

    const appointmentData = {
      doctor_id: newAppointment.doctor_id,
      date: isoDate,
    };

    try {
      const data = await fetchAPI(API_ENDPOINTS.APPOINTMENTS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
      setLoading(false);

      if (data.success) {
        setSuccess("Appointment created successfully!");
        setAppointments([data.data, ...appointments]);
        setNewAppointment({ doctor_id: "", date: "" });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to create appointment");
      }
    } catch (err) {
      setLoading(false);
      setError("Error creating appointment");
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const data = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/cancel/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: "CANCELLED" } : apt
          )
        );
        setSuccess("Appointment cancelled successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      setError("Error cancelling appointment");
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const data = await fetchAPI(`${API_ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAppointments(appointments.filter((apt) => apt.id !== id));
        setSuccess("Appointment deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to delete appointment");
      }
    } catch (err) {
      setError("Error deleting appointment");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDatesForNextDays = (days = 7) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimesForDay = (times = 6) => {
    const timeSlots = [];
    for (let i = 0; i < times; i++) {
      const hour = 6 + Math.floor(i / 3);
      const minute = (i % 3) * 30;
      timeSlots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
    return timeSlots;
  };

  const nextDates = getDatesForNextDays();
  const timeSlots = getTimesForDay();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Red Header Bar */}
      <div className="bg-[#a71930] px-8 py-4 flex justify-between items-center">
        <button
          onClick={handleLogout}
          className="bg-white rounded-full px-6 py-2 border-2 border-gray-800 font-bold text-lg hover:bg-gray-100 transition flex items-center gap-2"
        >
          ← Logout
        </button>
        <h2 className="text-white text-2xl font-bold">Reservasi</h2>
        <div className="w-20"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-black text-center mb-8 text-gray-800">
            Reservasi
          </h1>

          {/* Create Appointment Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Doctor Selection */}
              <div>
                <label className="block text-gray-800 font-bold mb-4 text-lg">
                  Pilih Layanan
                </label>
                <div className="bg-pink-200 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() =>
                          setNewAppointment({ ...newAppointment, doctor_id: doctor.id })
                        }
                        className={`px-6 py-3 rounded-full font-bold text-lg transition ${
                          newAppointment.doctor_id === doctor.id
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-800 border-2 border-gray-300"
                        }`}
                      >
                        {doctor.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-gray-800 font-bold mb-4 text-lg">
                  Pilih Tanggal
                </label>
                <div className="bg-pink-200 rounded-2xl p-6 overflow-x-auto">
                  <div className="flex gap-3 pb-2 min-w-max md:min-w-full md:flex-wrap">
                    {nextDates.map((date, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const dateStr = date.toISOString().split("T")[0];
                          const time = newAppointment.date.split("T")[1] || "06:30";
                          setNewAppointment({ ...newAppointment, date: `${dateStr}T${time}` });
                        }}
                        className={`px-4 py-2 rounded-lg font-bold text-center min-w-[120px] transition ${
                          newAppointment.date.split("T")[0] === date.toISOString().split("T")[0]
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-800 border-2 border-gray-300"
                        }`}
                      >
                        <div className="text-sm">
                          {date.toLocaleDateString("id-ID", { month: "2-digit", day: "2-digit" })}
                        </div>
                        <div className="text-xs font-semibold">
                          {date.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-gray-800 font-bold mb-4 text-lg">
                  Pilih Waktu
                </label>
                <div className="bg-pink-200 rounded-2xl p-6 overflow-x-auto">
                  <div className="flex gap-3 pb-2 min-w-max md:min-w-full md:flex-wrap">
                    {timeSlots.map((time, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const dateStr = newAppointment.date.split("T")[0] || "2025-01-01";
                          setNewAppointment({ ...newAppointment, date: `${dateStr}T${time}` });
                        }}
                        className={`px-4 py-2 rounded-lg font-bold min-w-[100px] transition ${
                          newAppointment.date.includes(time)
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-800 border-2 border-gray-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl font-bold">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl font-bold">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                {loading ? "Membuat..." : "Lanjut"}
              </button>
            </form>
          </div>

          {/* Appointments List */}
          {appointments.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
              <h2 className="text-2xl font-black mb-6 text-gray-800">
                Daftar Appointment Anda
              </h2>

              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-gray-800 font-bold text-lg">
                          Dokter: {apt.doctor?.name || "Unknown"}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-bold ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="bg-pink-100 rounded-xl p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-700">
                        📅{" "}
                        {new Date(apt.date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        🕐{" "}
                        {new Date(apt.date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-bold"
                        >
                          ✗ Cancel
                        </button>
                      )}
                      {(apt.status === "CANCELLED" || apt.status === "COMPLETED") && (
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-bold"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
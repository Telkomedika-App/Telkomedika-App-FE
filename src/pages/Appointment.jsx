import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/appointment";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return "";
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    doctor_id: "",
    date: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's appointments
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/student`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const handleChange = (e) => {
    setNewAppointment({
      ...newAppointment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Convert datetime-local to ISO-8601 with timezone
    const dateObj = new Date(`${newAppointment.date}:00`);
    const isoDate = dateObj.toISOString();

    const appointmentData = {
      doctor_id: newAppointment.doctor_id,
      date: isoDate,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("accessToken")}`,
      },
      body: JSON.stringify(appointmentData),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess("Appointment created successfully!");
      setAppointments([data.data, ...appointments]);
      setNewAppointment({ doctor_id: "", date: "" });
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.message || "Failed to create appointment");
    }
  };
// ...existing code...

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getCookie("accessToken")}`,
      },
    });
    const data = await res.json();

    if (res.ok) {
      setAppointments(appointments.filter((apt) => apt.id !== id));
      setSuccess("Appointment cancelled successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.message || "Failed to cancel appointment");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#ed1c24]">
          Reservasi Appointment
        </h1>

        {/* Create Appointment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Buat Appointment Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Doctor Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Pilih Dokter
              </label>
              <select
                name="doctor_id"
                value={newAppointment.doctor_id}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ed1c24]"
                required
              >
                <option value="">-- Pilih Dokter --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tanggal & Waktu
              </label>
              <input
                type="datetime-local"
                name="date"
                value={newAppointment.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ed1c24]"
                required
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400"
            >
              {loading ? "Membuat..." : "Buat Appointment"}
            </button>
          </form>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Daftar Appointment Anda
          </h2>

          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Anda belum memiliki appointment. Buat appointment baru di atas!
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-600">
                        Dokter: {apt.doctor?.name || "Unknown"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <p>
                        📅{" "}
                        {new Date(apt.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>
                        🕐{" "}
                        {new Date(apt.date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {apt.status === "PENDING" && (
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
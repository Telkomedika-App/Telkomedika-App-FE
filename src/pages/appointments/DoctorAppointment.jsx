import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:3000/api/appointment";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return "";
}

// Decode token immediately on component render
function getDoctorNameFromToken() {
  const token = getCookie("accessToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.name || "Doctor";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "Doctor";
    }
  }
  return "Doctor";
}

export default function DoctorAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [doctorName] = useState(() => getDoctorNameFromToken());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/doctor`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data || []);
      } else {
        setError(data.message || "Failed to fetch appointments");
      }
    } catch (err) {
      setError("Error fetching appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ...rest of the code stays the same...

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Appointment accepted!");
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: "CONFIRMED" } : apt
          )
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to accept appointment");
      }
    } catch (err) {
      setError("Error accepting appointment");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this appointment as ${newStatus}?`))
      return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(`Appointment marked as ${newStatus}!`);
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: newStatus } : apt
          )
        );
        setExpandedId(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update appointment");
      }
    } catch (err) {
      setError("Error updating appointment");
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment from history? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <p className="text-white text-lg font-bold">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-500 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Doctor Name Header */}
          <div className="mb-6 pb-6 border-b-2 border-gray-300">
            <p className="text-center text-gray-600 font-semibold text-sm">Dokter</p>
            <h1 className="text-3xl md:text-4xl font-black text-center text-gray-800">
              {doctorName}
            </h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-2 text-center text-gray-800">
            Reservasi
          </h2>
          <p className="text-center text-gray-600 mb-8 font-semibold">
            Appointment Requests
          </p>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 font-bold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4 font-bold">
              {success}
            </div>
          )}

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-12 font-semibold">
              No appointments found.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border-2 border-gray-300 rounded-2xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-black text-lg text-gray-800">
                        👤 {apt.student?.name || "Unknown Student"}
                      </p>
                      <p className="text-gray-600 font-semibold">
                        📧 {apt.student?.email || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="bg-pink-100 rounded-xl p-4 mb-4">
                    <p className="text-gray-800 font-bold">
                      📅{" "}
                      {new Date(apt.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-800 font-bold">
                      🕐{" "}
                      {new Date(apt.date).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {apt.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAccept(apt.id)}
                        className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition font-bold"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                        className="bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition font-bold"
                      >
                        ✗ Cancel
                      </button>
                    </div>
                  )}

                  {apt.status === "CONFIRMED" && (
                    <div>
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === apt.id ? null : apt.id)
                        }
                        className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition font-bold mb-3"
                      >
                        {expandedId === apt.id ? "▼ Hide Options" : "▶ Change Status"}
                      </button>

                      {expandedId === apt.id && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleStatusChange(apt.id, "COMPLETED")}
                            className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition font-bold"
                          >
                            ✓ Completed
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                            className="bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition font-bold"
                          >
                            ✗ Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(apt.status === "CANCELLED" || apt.status === "COMPLETED") && (
                    <button
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition font-bold"
                    >
                      🗑️ Delete from History
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
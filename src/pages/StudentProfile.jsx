import { useNavigate } from "react-router-dom";
import InputField from "../components/Field";
import Button from "../components/Button";
import Modal from "../components/Modal";
import useStudentProfile from "../hooks/useStudentProfile";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function StudentProfile() {
  const navigate = useNavigate();
  const {
    student,
    loading,
    error,
    isEditModalOpen,
    isLogoutModalOpen,
    isSubmitting,
    editError,
    editSuccess,
    formData,
    handleInputChange,
    handleSaveProfile,
    handleLogout,
    openEditModal,
    closeEditModal,
    openLogoutModal,
    closeLogoutModal,
  } = useStudentProfile();

  const [showHistory, setShowHistory] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getInitial = () => {
    const name =
      student?.name ||
      student?.fullName ||
      (localStorage.getItem("studentName") || "").trim() ||
      (() => {
        try {
          const token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("authToken");
          if (!token) return "";
          const decoded = jwtDecode(token);
          return decoded?.name || decoded?.fullName || decoded?.username || "";
        } catch {
          return "";
        }
      })();
    if (name) return name.charAt(0).toUpperCase();
    return "S"; 
  };

  const getDisplayName = () => {
    return student?.name || student?.fullName || (localStorage.getItem("studentName") || "").trim() || "Mahasiswa";
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
      {/*  OVERLAY GELAP  */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/*  KONTEN  */}
      <div className="relative z-10">
        {/*  HEADER  */}
        <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
          {/* LEFT  */}
          <div className="flex items-center gap-4">
            {/* Tombol Kembali */}
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors duration-200"
            >
              <span className="text-4xl font-bold">‹</span>
            </button>
          </div>

          {/* MENU CENTER */}
          <nav className="flex gap-8 font-medium">
            <button 
              onClick={() => navigate("/beranda-student")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Beranda
            </button>
            <button 
              onClick={() => navigate("/artikel/student")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Artikel Kesehatan
            </button>
            <button 
              onClick={() => navigate("/forum")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Forum Diskusi
            </button>
            <button 
              onClick={() => navigate("/student-appointments")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Reservasi
            </button>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Profil */}
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-xl font-bold shadow-lg"
              >
                {getInitial()}
              </div>
              <span className="text-white font-medium">
                {getDisplayName()}
              </span>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-white/30"></div>

            {/* Logout Button */}
            <button
              onClick={openLogoutModal}
              className="bg-white text-[#7A0C0C] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-lg"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="relative w-48 h-48 mb-6">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-6xl font-bold border-4 border-white shadow-xl">
                      {getInitial()}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-[#7A0C0C]">Profil Mahasiswa</h1>
                </div>

                {/* Profile Information Section */}
                <div className="flex-1 w-full">
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Nama Lengkap
                      </label>
                      <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                        {student?.name || "-"}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email
                      </label>
                      <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                        {student?.email || "-"}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Nomor Telepon
                      </label>
                      <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                        {student?.phone || "-"}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <button
                        onClick={openEditModal}
                        className="flex-1 bg-[#a71930] text-white px-6 py-3 rounded-xl hover:bg-[#8b1428] font-semibold transition-colors duration-200 shadow-lg"
                      >
                        Edit Profil
                      </button>
                      
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex-1 bg-white text-[#a71930] px-6 py-3 rounded-xl hover:bg-gray-100 font-semibold transition-colors duration-200 shadow-lg border-2 border-[#a71930] flex items-center justify-center gap-2"
                      >
                        {showHistory ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                            Sembunyikan Riwayat
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                            Lihat Riwayat
                            {student?.appointment_history?.length > 0 && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {student.appointment_history.length}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Appointment History Section  */}
                  {showHistory && (
                    <div 
                      className="bg-white rounded-xl shadow-lg p-6 mt-8 border border-gray-200"
                      style={{
                        animation: 'fadeIn 0.3s ease-out'
                      }}
                    >
                      <style jsx>{`
                        @keyframes fadeIn {
                          from {
                            opacity: 0;
                            transform: translateY(-10px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                      `}</style>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-[#7A0C0C]">
                            Riwayat Reservasi
                          </h2>
                          <div className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {student?.appointment_history?.length || 0} Reservasi
                          </div>
                        </div>
                        <button
                          onClick={() => setShowHistory(false)}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
                          aria-label="Tutup riwayat"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {student?.appointment_history?.length > 0 ? (
                        <>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal & Waktu
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dokter
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Layanan
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dibuat
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {student.appointment_history.map((appointment) => (
                                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {formatDate(appointment.date)}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {formatTime(appointment.time)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {appointment.doctor?.name || '-'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        appointment.service === 'general' 
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-purple-100 text-purple-800'
                                      }`}>
                                        {appointment.service === 'general' ? 'Umum' : 'Gigi'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Selesai
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatDate(appointment.createdAt)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Info Note */}
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm text-gray-600">
                                Hanya menampilkan riwayat reservasi dengan status <span className="font-semibold">"Selesai"</span>.
                                Reservasi yang sedang diproses tidak akan ditampilkan di sini.
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Belum Ada Riwayat Reservasi
                          </h3>
                          <p className="text-gray-500">
                            Anda belum memiliki reservasi yang sudah diselesaikan.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Edit Profil"
        onClose={closeEditModal}
      >
        <form className="space-y-4">
          {editError && (
            <div className="bg-red-100 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded text-sm">
              {editError}
            </div>
          )}
          {editSuccess && (
            <div className="bg-green-100 border-l-4 border-green-600 text-green-700 px-4 py-3 rounded text-sm">
              {editSuccess}
            </div>
          )}

          <InputField
            type="text"
            label="Nama Pengguna"
            placeholder="Nama Pengguna"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />

          <InputField
            type="email"
            label="Email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />

          <InputField
            type="tel"
            label="Nomor Telepon"
            placeholder="Nomor Telepon"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />

          <hr className="my-4" />

          <div className="text-sm text-gray-600 mb-2">
            Untuk mengubah password, isi form di bawah ini:
          </div>

          <InputField
            type="password"
            label="Password Lama"
            placeholder="Password Lama"
            name="old_password"
            value={formData.old_password}
            onChange={handleInputChange}
          />

          <InputField
            type="password"
            label="Password Baru"
            placeholder="Password Baru"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />

          <InputField
            type="password"
            label="Konfirmasi Password"
            placeholder="Konfirmasi Password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleInputChange}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeEditModal}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#a71930] text-white rounded-lg font-semibold hover:bg-[#8b1428] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar"
        onClose={closeLogoutModal}
      >
        <div className="space-y-6">
          <p className="text-gray-700 text-center text-lg">
            Apakah Anda Yakin Ingin Keluar?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeLogoutModal}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

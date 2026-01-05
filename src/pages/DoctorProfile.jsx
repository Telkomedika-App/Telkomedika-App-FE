import { useNavigate } from "react-router-dom";
import DoctorPageLayout from "../components/DoctorPageLayout";
import Modal from "../components/Modal";
import InputField from "../components/Field";
import Button from "../components/Button";
import useDoctorProfile from "../hooks/useDoctorProfile";

export default function DoctorProfile() {
  const navigate = useNavigate();
  const {
    doctor,
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
  } = useDoctorProfile();

  const getInitial = () => {
    if (doctor?.name) {
      return doctor.name.charAt(0).toUpperCase();
    }
    return "D";
  };

  const getDisplayName = () => {
    return doctor?.name || "Dokter";
  };

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
              onClick={() => navigate("/beranda-doctor")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Beranda
            </button>
            <button
              onClick={() => navigate("/artikel/doctor")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Artikel Kesehatan
            </button>
            <button
              onClick={() => navigate("/doctor/forum")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Forum Diskusi
            </button>
            <button
              onClick={() => navigate("/doctor-appointments")}
              className="hover:text-gray-200 transition-colors duration-200"
            >
              Reservasi
            </button>
          </nav>

          {/* RIGHT  */}
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
          <div className="max-w-4xl w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="relative w-48 h-48 mb-6">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-6xl font-bold border-4 border-white shadow-xl">
                      {getInitial()}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-[#7A0C0C]">Profil Admin</h1>
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
                        {doctor?.name || "-"}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email
                      </label>
                      <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                        {doctor?.email || "-"}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Nomor Telepon
                      </label>
                      <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                        {doctor?.phone || "-"}
                      </div>
                    </div>

                    {/* Edit Button */}
                    <div className="pt-6">
                      <button
                        onClick={openEditModal}
                        className="w-full bg-[#a71930] text-white px-6 py-3 rounded-xl hover:bg-[#8b1428] font-semibold transition-colors duration-200 shadow-lg"
                      >
                        Edit Profil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Edit Profil Dokter"
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
            label="Nama Dokter"
            placeholder="Nama Dokter"
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
            Apakah Anda yakin ingin keluar?
          </p>

          <div className="flex gap-4">
            {/* Batal – KIRI */}
            <button
              onClick={closeLogoutModal}
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Batal
            </button>

            {/* Ya, Keluar – KANAN */}
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
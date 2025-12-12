import Header from "../components/Header";
import InputField from "../components/Field";
import Button from "../components/Button";
import Modal from "../components/Modal";
import useStudentProfile from "../hooks/useStudentProfile";

export default function StudentProfile() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-100 border-l-4 border-red-600 text-red-700 px-6 py-4 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Side - Profile Picture */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative w-48 h-48 mb-6">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-6xl font-bold border-4 border-gray-300 shadow-lg">
                  {student?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <button className="absolute bottom-3 right-3 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Side - Profile Info */}
            <div className="flex-1 w-full">
              <div className="space-y-4">
                {/* Nama Pengguna */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-800 font-semibold">
                      Nama Pengguna
                    </label>
                  </div>
                  <div className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    {student?.name}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-800 font-semibold">
                      Email
                    </label>
                  </div>
                  <div className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    {student?.email}
                  </div>
                </div>

                {/* Nomor Telepon */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-800 font-semibold">
                      Nomor Telepon
                    </label>
                  </div>
                  <div className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    {student?.phone}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-8">
                  <Button
                    onClick={openEditModal}
                    variant="primary"
                    fullWidth
                    className="rounded-lg"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={openLogoutModal}
                    variant="danger"
                    fullWidth
                    className="rounded-lg"
                  >
                    Keluar
                  </Button>
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
            <Button
              type="button"
              onClick={closeEditModal}
              variant="secondary"
              fullWidth
              className="rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              variant="success"
              fullWidth
              className="rounded-lg"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
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
            Apakah Anda Yakin <br /> Ingin Keluar?
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={closeLogoutModal}
              variant="secondary"
              fullWidth
              className="rounded-lg"
            >
              Tidak
            </Button>
            <Button
              type="button"
              onClick={handleLogout}
              variant="danger"
              fullWidth
              className="rounded-lg"
            >
              Ya
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
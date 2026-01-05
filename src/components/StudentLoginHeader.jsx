import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function StudentLoginHeader() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* HEADER */}
      <div className="bg-[#a71930] px-8 py-4 flex items-center justify-between">
        {/* Left: Profile Button */}
        <button
          onClick={() => navigate("/student-profile")}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow hover:ring-2 hover:ring-[#a71930] transition"
          aria-label="Profile"
        >
          {/* Avatar */}
        </button>

        {/* Center: Navigation */}
        <div className="flex gap-6">
          <Link
            to="/beranda-student"
            className="text-white font-semibold px-4 py-2 rounded hover:bg-[#8b1428] transition"
          >
            Beranda
          </Link>
          <Link
            to="/artikel/student"
            className="text-white font-semibold px-4 py-2 rounded hover:bg-[#8b1428] transition"
          >
            Artikel Kesehatan
          </Link>
          <Link
            to="/forum"
            className="text-white font-semibold px-4 py-2 rounded hover:bg-[#8b1428] transition"
          >
            Forum Diskusi
          </Link>
          <Link
            to="/student-appointments"
            className="text-white font-semibold px-4 py-2 rounded hover:bg-[#8b1428] transition"
          >
            Reservasi
          </Link>
        </div>

        {/* Right: Logout */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="bg-white text-[#a71930] font-semibold px-6 py-2 rounded hover:bg-gray-200 transition"
        >
          Keluar
        </button>
      </div>

      {/* LOGOUT MODAL */}
      <Modal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar"
        onClose={() => setIsLogoutModalOpen(false)}
      >
        <div className="space-y-6">
          <p className="text-gray-700 text-center text-lg">
            Apakah Anda yakin ingin keluar?
          </p>

          {/* BUTTONS */}
          <div className="flex gap-3">
            {/* KIRI */}
            <Button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              variant="secondary"
              fullWidth
              className="rounded-lg"
            >
              Batal
            </Button>

            {/* KANAN */}
            <Button
              type="button"
              onClick={handleLogout}
              variant="danger"
              fullWidth
              className="rounded-lg"
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

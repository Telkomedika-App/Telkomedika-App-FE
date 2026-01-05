import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../utils/constants";
import { getPost, deleteComment, deletePost } from "../../api/forum";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} detik lalu`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

// Komponen untuk menampilkan inisial dalam lingkaran
const ProfileInitial = ({ name, size = 8 }) => {
  const getInitial = () => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    return "U"; // Default "U" untuk User
  };

  const getRandomColor = () => {
    const colors = [
      "bg-[#a71930]", // Merah TelkoMedika
      "bg-[#7A0C0C]", // Merah tua
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600"
    ];
    // Gunakan hash sederhana dari nama untuk warna konsisten
    if (!name) return colors[0];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      className={`w-${size} h-${size} rounded-full ${getRandomColor()} flex items-center justify-center text-white font-bold`}
      style={{
        fontSize: size === 8 ? '0.875rem' : '1rem',
        minWidth: `${size * 0.25}rem`,
        minHeight: `${size * 0.25}rem`
      }}
    >
      {getInitial()}
    </div>
  );
};

export default function DoctorForumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Auth check dan ambil data doctor
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

    if (!token || userType !== "doctor") {
      navigate(ROUTES.LOGIN);
    } else {
      // Ambil data doctor profil
      const fetchDoctorData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/doctor/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data.success) {
            setDoctorData(response.data.data);
          } else {
            // Fallback ke data dari localStorage
            const savedName = localStorage.getItem("doctorName");
            if (savedName) {
              setDoctorData({ name: savedName });
            }
          }
        } catch (error) {
          console.error("Error fetching doctor data:", error);
          // Fallback ke data dari localStorage
          const savedName = localStorage.getItem("doctorName");
          if (savedName) {
            setDoctorData({ name: savedName });
          }
        } finally {
          setAuthLoading(false);
        }
      };

      fetchDoctorData();
    }
  }, [navigate]);

  // Load post and comments
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPost(id);
      if (res && res.success) {
        setPost(res.data);
        // Sort comments ascending (oldest first, latest last)
        setComments(
          Array.isArray(res.data.comments)
            ? [...res.data.comments].sort(
              (a, b) => new Date(a.created_at) - new Date(b.created_at)
            )
            : []
        );
      } else {
        setError(res?.message || "Gagal memuat detail forum");
      }
    } catch (e) {
      setError("Gagal memuat detail forum");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id && !authLoading) {
      load();
    }
  }, [id, authLoading]);

  // Komentar tidak dapat ditambahkan pada halaman dokter

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Hapus komentar ini?")) return;
    const res = await deleteComment(commentId);
    if (res && res.success) {
      await load();
    } else {
      alert(res?.message || "Gagal menghapus komentar");
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Hapus postingan ini?")) return;
    const res = await deletePost(id);
    if (res && res.success) {
      navigate("/doctor/forum");
    } else {
      alert(res?.message || "Gagal menghapus postingan");
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("doctorName");

    // Navigate to login
    navigate("/login");
  };

  // Ambil initial dari nama (huruf pertama)
  const getInitial = () => {
    if (doctorData?.name) {
      return doctorData.name.charAt(0).toUpperCase();
    }
    return "D"; // Default "D" untuk Dokter
  };

  // Dapatkan nama user untuk ditampilkan
  const getDisplayName = () => {
    if (doctorData?.name) {
      return `Dr. ${doctorData.name}`;
    }
    // Coba ambil dari localStorage atau default
    const savedName = localStorage.getItem("doctorName");
    if (savedName) {
      return `Dr. ${savedName}`;
    }
    return ""; // Kosongkan jika tidak ada data
  };

  if (authLoading) {
    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/background.png")' }}
    >
      {/* ===== OVERLAY GELAP ===== */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* ===== KONTEN ===== */}
      <div className="relative z-10">
        {/* ===== HEADER ===== */}
        <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
          {/* LEFT - Profil dengan Link dan background gradient */}
          <Link to="/doctor-profile" className="flex items-center gap-3 no-underline">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:opacity-90 transition-opacity"
              style={{ border: 'none' }}
            >
              {getInitial()}
            </div>
            {displayName && (
              <span className="text-white font-medium text-lg">
                {displayName}
              </span>
            )}
          </Link>

          {/* MENU */}
          <nav className="flex gap-8 font-medium">
            <Link to="/doctor/beranda" className="hover:text-gray-200">
              Beranda
            </Link>
            <Link to="/doctor/artikel" className="hover:text-gray-200">
              Artikel Kesehatan
            </Link>
            <Link to="/doctor/forum" className="text-yellow-300 underline font-semibold">
              Forum Diskusi
            </Link>
            <Link to="/doctor/appointments" className="hover:text-gray-200">
              Reservasi
            </Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Keluar
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-4xl flex flex-col"
            style={{ height: "80vh", maxHeight: 700, minHeight: 400 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-full p-2 hover:bg-gray-200 text-[#a71930] font-bold"
                >
                  <span className="text-xl">‹</span>
                </button>
                <div className="text-2xl font-semibold text-[#a71930]">Detail Forum</div>
              </div>
              <button
                onClick={handleDeletePost}
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Hapus Post
              </button>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Memuat...</div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-600">{error}</div>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto" style={{ minHeight: 0 }}>
                {/* Post */}
                <div className="bg-white border border-red-200 rounded-xl shadow-sm p-4 mb-6">
                  <div className="flex items-center mb-2">
                    {/* inisial profil */}
                    <div className="mr-3">
                      <ProfileInitial name={post?.author?.name} size={8} />
                    </div>
                    <div className="font-semibold">{post?.author?.name || "Pengguna"}</div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{timeAgo(post?.created_at)}</span>
                    <span>{comments.length} Komentar</span>
                  </div>
                  <div className="mt-2 text-gray-800 whitespace-pre-line">{post?.content}</div>
                </div>

                {/* Comments */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {comments.length === 0 && (
                    <div className="text-gray-500 text-center">Belum ada komentar.</div>
                  )}
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="mr-2">
                            <ProfileInitial name={c.author?.name} size={7} />
                          </div>
                          <div className="font-semibold text-sm">{c.author?.name || "Pengguna"}</div>
                          <div className="ml-2 text-xs text-gray-500">{timeAgo(c.created_at)}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="text-gray-800 text-sm whitespace-pre-line">{c.content}</div>
                    </div>
                  ))}
                </div>

                {/* Form komentar dihilangkan */}
              </div>
            )}
          </div>
        </div>

        {/*  MODAL KONFIRMASI LOGOUT  */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-2 text-center">
                Konfirmasi Keluar
              </h3>
              <p className="text-gray-700 mb-6 text-center">
                Apakah Anda yakin ingin keluar?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

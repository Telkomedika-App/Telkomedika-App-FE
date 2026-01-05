import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { listPosts, createPost } from "../../api/forum";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../utils/constants";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";
import { jwtDecode } from "jwt-decode";

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

const ProfileInitial = ({ name, size = 8 }) => {
  const getInitial = () => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  const getRandomColor = () => {
    const colors = [
      "bg-[#a71930]",
      "bg-[#7A0C0C]",
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600"
    ];
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

export default function StudentForum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

    if (!token || userType !== "student") {
      navigate(ROUTES.LOGIN);
    } else {
      const fetchStudentData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/student/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data.success) {
            setStudentData(response.data.data);
          } else {
            const savedName = localStorage.getItem("studentName");
            if (savedName) {
              setStudentData({ name: savedName });
            }
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
          // Fallback ke data dari localStorage
          const savedName = localStorage.getItem("studentName");
          if (savedName) {
            setStudentData({ name: savedName });
          }
        } finally {
          setAuthLoading(false);
        }
      };

      fetchStudentData();
    }
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    setError("");

    const res = await listPosts();
    if (res && res.success) {
      setPosts(Array.isArray(res.data) ? res.data : []);
    } else {
      setError(res?.message || "Gagal memuat forum");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      load();
    }
  }, [authLoading]);

  const handleCreate = async () => {
    if (!content.trim()) {
      alert("Konten postingan tidak boleh kosong.");
      return;
    }

    setCreating(true);

    const defaultTitle = content.trim().substring(0, 20) +
      (content.trim().length > 20 ? "..." : "") +
      " - " + new Date().toLocaleDateString('id-ID');

    const res = await createPost(defaultTitle, content.trim());

    if (res && res.success) {
      setShowModal(false);
      setContent("");
      await load();
    } else {
      alert(res?.message || "Gagal membuat postingan.");
    }

    setCreating(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("activeReservation");
    localStorage.removeItem("lastShownCancellationId");
    localStorage.removeItem("studentName");

    navigate("/login");
  };

  const getInitial = () => {
    const name =
      studentData?.name ||
      studentData?.fullName ||
      (localStorage.getItem("studentName") || "").trim() ||
      (() => {
        try {
          const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem("authToken") || localStorage.getItem("token");
          if (!token) return "";
          const decoded = jwtDecode(token);
          return decoded?.name || decoded?.fullName || decoded?.username || "";
        } catch {
          return "";
        }
      })();
    if (name) return name.charAt(0).toUpperCase();
    return "K";
  };

  const getDisplayName = () => {
    if (studentData?.name) return studentData.name;
    if (studentData?.fullName) return studentData.fullName;
    const savedName = (localStorage.getItem("studentName") || "").trim();
    if (savedName) return savedName;
    return "";
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
      {/*  OVERLAY GELAP  */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/*  KONTEN  */}
      <div className="relative z-10">
        {/*  HEADER  */}
        <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
          {/* LEFT */}
          <Link to="/student-profile" className="flex items-center gap-3 no-underline">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:opacity-90 transition-opacity"
              style={{ border: 'none' }}
            >
              {getInitial()}
            </div>
          </Link>

          {/* MENU */}
          <nav className="flex gap-8 font-medium">
            <Link to="/beranda-student" className="hover:text-gray-200">
              Beranda
            </Link>
            <Link to="/artikel/student" className="hover:text-gray-200">
              Artikel Kesehatan
            </Link>
            <Link to="/forum" className="text-yellow-300 underline font-semibold">
              Forum Diskusi
            </Link>
            <Link to="/student-appointments" className="hover:text-gray-200">
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
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="rounded-full p-2 hover:bg-gray-200 text-[#a71930] font-bold"
              >
                <span className="text-xl">‹</span>
              </button>
              <div className="text-2xl font-semibold text-[#a71930]">Forum Diskusi</div>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {loading && <div className="text-center text-gray-500">Memuat...</div>}
              {error && <div className="text-center text-red-600">{error}</div>}

              <div className="space-y-4">
                {posts.map((p) => (
                  <div
                    key={p.id}
                    className="border border-red-200 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md bg-white"
                    onClick={() => navigate(`/forum/${p.id}`)}
                  >
                    <div className="flex items-center mb-2">
                      {/* Ganti gambar dengan inisial profil */}
                      <div className="mr-3">
                        <ProfileInitial name={p.author?.fullName || p.author?.name || p.author?.username} size={8} />
                      </div>
                      <div className="font-semibold">{p.author?.fullName || p.author?.name || p.author?.username || "Pengguna"}</div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{timeAgo(p.created_at)}</span>
                      <span>{p.comments?.length || 0} Komentar</span>
                    </div>
                    <div className="mt-2 text-gray-800 whitespace-pre-line">{p.content}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Tombol buat posting */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow flex items-center"
              >
                <span className="mr-2 text-xl">＋</span>
                Buat Postingan
              </button>
            </div>
          </div>
        </div>

        {/* Modal buat post */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:w-[32rem] p-6 rounded-t-2xl sm:rounded-2xl">
              <div className="text-lg font-semibold mb-4">Buat Postingan Baru</div>

              <textarea
                className="w-full border rounded-lg p-3 h-40 mb-4 text-base"
                placeholder="Apa yang ingin Anda bagikan?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => {
                    setShowModal(false);
                    setContent("");
                  }}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleCreate}
                  disabled={creating || !content.trim()}
                >
                  {creating ? "Mengunggah..." : "Unggah"}
                </button>
              </div>
            </div>
          </div>
        )}

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

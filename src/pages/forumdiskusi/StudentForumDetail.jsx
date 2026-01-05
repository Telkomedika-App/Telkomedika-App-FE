import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../utils/constants";
import { getPost, addComment } from "../../api/forum";
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

export default function StudentForumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
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
    try {
      const res = await getPost(id);
      if (res && res.success) {
        setPost(res.data);
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

  const handleCreate = async () => {
    if (!comment.trim()) {
      alert("Komentar tidak boleh kosong.");
      return;
    }
    setCreating(true);
    const res = await addComment(id, comment.trim());
    if (res && res.success) {
      setComment("");
      await load();
    } else {
      alert(res?.message || "Gagal mengirim komentar.");
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
          {/* LEFT  */}
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
              <div className="text-2xl font-semibold text-[#a71930]">Detail Forum</div>
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
                      <ProfileInitial name={post?.author?.fullName || post?.author?.name || post?.author?.username} size={8} />
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
                      <div className="flex items-center mb-1">
                        <div className="mr-2">
                          <ProfileInitial name={c.author?.fullName || c.author?.name || c.author?.username} size={7} />
                        </div>
                        <div className="font-semibold text-sm">{c.author?.fullName || c.author?.name || c.author?.username || "Pengguna"}</div>
                        <div className="ml-2 text-xs text-gray-500">{timeAgo(c.created_at)}</div>
                      </div>
                      <div className="text-gray-800 text-sm whitespace-pre-line">{c.content}</div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4 flex gap-2">
                  <input
                    className="flex-1 border rounded-lg p-2"
                    placeholder="Tulis komentar..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                    disabled={creating}
                  />
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? "Mengirim..." : "Kirim"}
                  </button>
                </div>
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

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getArtikel, listStudentArticles } from "../../api/artikel";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../utils/constants";
import { jwtDecode } from "jwt-decode";

export default function StudentArtikel() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [authLoading, setAuthLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const kategoriList = [
    { value: "semua", label: "Semua Kategori" },
    { value: "umum", label: "Umum" },
    { value: "penyakit", label: "Penyakit" },
    { value: "gaya-hidup", label: "Gaya Hidup" },
    { value: "makanan-sehat", label: "Makanan Sehat" },
    { value: "olahraga", label: "Olahraga" },
    { value: "mental-health", label: "Mental Health" }
  ];

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

    if (!token || userType !== "student") {
      navigate(ROUTES.LOGIN);
    } else {
      const savedName = localStorage.getItem("studentName");
      if (savedName) {
        setStudentData({ name: savedName });
      }
      setAuthLoading(false);
    }
  }, [navigate]);

  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listStudentArticles();
      setArticles(res?.data || []);
    } catch {
      setError("Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await getArtikel(id);
      setSelected(res?.data || null);
    } catch {
      setError("Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetail();
    else loadList();
  }, [id]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "semua") {
      return articles;
    }
    return articles.filter(article => article.kategori === selectedCategory);
  }, [articles, selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
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

  const Card = ({ item }) => (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={() => navigate(`/artikel/student/${item.id}`)}
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={item.gambar_url || "/article-placeholder.jpg"}
          alt={item.judul}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.target.src = "/article-placeholder.jpg")}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-lg text-[#a71930] line-clamp-2">{item.judul}</div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${item.kategori === 'penyakit' ? 'bg-red-100 text-red-800' :
            item.kategori === 'gaya-hidup' ? 'bg-green-100 text-green-800' :
              item.kategori === 'makanan-sehat' ? 'bg-yellow-100 text-yellow-800' :
                item.kategori === 'olahraga' ? 'bg-blue-100 text-blue-800' :
                  item.kategori === 'mental-health' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
            }`}>
            {kategoriList.find(k => k.value === item.kategori)?.label || item.kategori}
          </span>
        </div>
        <div className="text-gray-600 text-sm line-clamp-3">{item.excerpt || ""}</div>
      </div>
    </div>
  );

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

  const initial = getInitial();

  if (id && selected) {
    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
        {/* OVERLAY GELAP */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* KONTEN */}
        <div className="relative z-10">
          {/* HEADER */}
          <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
            {/* Avatar  */}
            <Link to="/student-profile" className="flex items-center gap-3 no-underline">
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                style={{ border: 'none' }}
              >
                {initial}
              </div>
            </Link>

            {/* MENU */}
            <nav className="flex gap-8 font-medium">
              <Link to="/beranda-student" className="hover:text-gray-200 transition-colors duration-200">
                Beranda
              </Link>
              <Link to="/artikel/student" className="text-yellow-300 underline font-semibold hover:text-yellow-200 transition-colors duration-200">
                Artikel Kesehatan
              </Link>
              <Link to="/forum" className="hover:text-gray-200 transition-colors duration-200">
                Forum Diskusi
              </Link>
              <Link to="/student-appointments" className="hover:text-gray-200 transition-colors duration-200">
                Reservasi
              </Link>
            </nav>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Keluar
              </button>
            </div>
          </header>

          {/* Detail Artikel */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 w-full">
              {/* Tombol Kembali*/}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-[#a71930] hover:text-[#8b1428] font-semibold transition-colors duration-200"
                >
                  <span className="text-2xl">‹</span>
                  <span>Kembali ke Daftar Artikel</span>
                </button>
              </div>

              <div className="w-full overflow-hidden rounded-2xl mb-6">
                <img
                  src={selected.gambar_url || "/article-placeholder.jpg"}
                  alt={selected.judul}
                  className="w-full max-h-[400px] object-cover"
                />
              </div>
              <h1 className="text-4xl font-bold text-[#7A0C0C] mb-4">{selected.judul}</h1>

              {/* Kategori */}
              <div className="mb-6">
                <span className="inline-block bg-[#a71930] text-white text-sm px-4 py-2 rounded-full">
                  {kategoriList.find(k => k.value === selected.kategori)?.label || selected.kategori}
                </span>
              </div>

              <div className="mt-4 text-gray-800 whitespace-pre-line leading-relaxed text-lg">
                {selected.konten}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
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
    );
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
      {/* OVERLAY GELAP*/}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* KONTEN */}
      <div className="relative z-10">
        {/* HEADER */}
        <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
          {/* LEFT */}
          <Link to="/student-profile" className="flex items-center gap-3 no-underline">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:opacity-90 transition-opacity"
              style={{ border: 'none' }}
            >
              {initial}
            </div>
          </Link>

          {/* MENU */}
          <nav className="flex gap-8 font-medium">
            <Link to="/beranda-student" className="hover:text-gray-200 transition-colors duration-200">
              Beranda
            </Link>
            <Link to="/artikel/student" className="text-yellow-300 underline font-semibold hover:text-yellow-200 transition-colors duration-200">
              Artikel Kesehatan
            </Link>
            <Link to="/forum" className="hover:text-gray-200 transition-colors duration-200">
              Forum Diskusi
            </Link>
            <Link to="/student-appointments" className="hover:text-gray-200 transition-colors duration-200">
              Reservasi
            </Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Articles Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-6xl flex flex-col"
            style={{ height: "80vh", maxHeight: 700, minHeight: 400 }}
          >
            {/* Header*/}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#a71930] hover:text-[#8b1428] font-semibold transition-colors duration-200"
              >
                <span className="text-2xl">‹</span>
                <span>Kembali</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-semibold text-[#a71930]">Artikel Kesehatan</h1>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-gray-700 font-medium">Filter:</div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-2 border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#a71930] min-w-[200px]"
                >
                  {kategoriList.map(kategori => (
                    <option key={kategori.value} value={kategori.value}>
                      {kategori.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Muat Ulang */}
              <button
                onClick={loadList}
                className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium transition-colors duration-200"
              >
                Muat Ulang Artikel
              </button>
            </div>

            {/* Selected Category Display */}
            {selectedCategory !== "semua" && (
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-[#a71930] text-white px-4 py-2 rounded-full">
                  <span>Kategori: <strong>{kategoriList.find(k => k.value === selectedCategory)?.label}</strong></span>
                  <button
                    onClick={() => setSelectedCategory("semua")}
                    className="text-white hover:text-gray-200 ml-2 transition-colors duration-200"
                    title="Tampilkan semua"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Menampilkan {filteredArticles.length} artikel dari {articles.length} total
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 mb-4 bg-red-100 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {loading ? (
                <div className="text-center py-20 text-gray-600">Memuat artikel...</div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  {selectedCategory === "semua"
                    ? "Tidak ada artikel ditemukan"
                    : `Tidak ada artikel dalam kategori "${kategoriList.find(k => k.value === selectedCategory)?.label}"`}
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    Menampilkan {filteredArticles.length} artikel
                    {selectedCategory !== "semua" && ` dalam kategori "${kategoriList.find(k => k.value === selectedCategory)?.label}"`}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((a) => (
                      <Card key={a.id} item={a} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MODAL KONFIRMASI LOGOUT */}
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

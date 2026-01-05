import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createArtikel, deleteArtikel, getArtikel, listPublicArticles, updateArtikel } from "../../api/artikel";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../utils/constants";

export default function DoctorArtikel() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [authLoading, setAuthLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    konten: "",
    kategori: "umum",
    gambar_url: "",
    tags: []
  });

  const kategoriList = [
    { value: "semua", label: "Semua Kategori" },
    { value: "umum", label: "Umum" },
    { value: "penyakit", label: "Penyakit" },
    { value: "gaya-hidup", label: "Gaya Hidup" },
    { value: "makanan-sehat", label: "Makanan Sehat" },
    { value: "olahraga", label: "Olahraga" },
    { value: "mental-health", label: "Mental Health" }
  ];

  const headerTitle = useMemo(() => {
    if (id) return selected?.judul || "Detail Artikel";
    return "Artikel Kesehatan";
  }, [id, selected]);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

    if (!token || userType !== "doctor") {
      navigate(ROUTES.LOGIN);
    } else {
      const savedName = localStorage.getItem("doctorName");
      if (savedName) {
        setDoctorData({ name: savedName });
      }
      setAuthLoading(false);
    }
  }, [navigate]);

  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listPublicArticles();
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
      setForm({
        judul: res?.data?.judul || "",
        konten: res?.data?.konten || "",
        kategori: res?.data?.kategori || "umum",
        gambar_url: res?.data?.gambar_url || "",
        tags: Array.isArray(res?.data?.tags) ? res.data.tags : []
      });
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

  const submitCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags)
          ? form.tags
          : String(form.tags || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
      };

      const res = await createArtikel(payload);
      if (res?.success) {
        alert("Artikel berhasil dibuat");
        setShowForm(false);
        setForm({ judul: "", konten: "", kategori: "umum", gambar_url: "", tags: [] });
        loadList();
      } else {
        setError(res?.message || "Gagal membuat artikel");
      }
    } catch {
      setError("Gagal membuat artikel");
    } finally {
      setLoading(false);
    }
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags)
          ? form.tags
          : String(form.tags || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
      };

      const res = await updateArtikel(id, payload);
      if (res?.success) {
        alert("Artikel berhasil diperbarui");
        loadDetail();
      } else {
        setError(res?.message || "Gagal memperbarui artikel");
      }
    } catch {
      setError("Gagal memperbarui artikel");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => setShowDeleteConfirm(true);

  const executeDelete = async () => {
    if (!id) return;
    setShowDeleteConfirm(false);
    setError("");
    setLoading(true);

    try {
      const res = await deleteArtikel(id);
      if (res?.success) {
        alert("Artikel dihapus");
        navigate("/artikel/doctor");
      } else {
        setError(res?.message || "Gagal menghapus artikel");
      }
    } catch {
      setError("Gagal menghapus artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("doctorName");
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
    
    navigate("/login");
  };

  const getInitial = () => {
    if (doctorData?.name) {
      return doctorData.name.charAt(0).toUpperCase();
    }
    const savedName = localStorage.getItem("doctorName");
    if (savedName && savedName.trim().length > 0) {
      return savedName.trim().charAt(0).toUpperCase();
    }
    return "D"; 
  };

  const getDisplayName = () => {
    if (doctorData?.name) {
      return doctorData.name;
    }
    const savedName = localStorage.getItem("doctorName");
    if (savedName) {
      return savedName;
    }
    return "Dokter"; 
  };

  const Card = ({ item }) => (
    <div
      className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => navigate(`/artikel/doctor/${item.id}`)}
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
          <div className="font-semibold text-lg line-clamp-2">{item.judul}</div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            item.kategori === 'penyakit' ? 'bg-red-100 text-red-800' :
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

  const displayName = getDisplayName();

  if (id && selected) {
    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/background.png")' }}>
        {/* OVERLAY GELAP */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/*KONTEN*/}
        <div className="relative z-10">
          {/* ===== HEADER ===== */}
          <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
            {/*Profil*/}
            <Link to="/doctor-profile" className="flex items-center gap-3 no-underline">
              <div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                style={{ border: 'none' }}
              >
                {getInitial()}
              </div>
            </Link>

            {/* MENU */}
            <nav className="flex gap-8 font-medium">
              <Link to="/beranda-doctor" className="hover:text-gray-200">
                Beranda
              </Link>
              <Link to="/artikel/doctor" className="text-yellow-300 underline font-semibold">
                Artikel Kesehatan
              </Link>
              <Link to="/doctor/forum" className="hover:text-gray-200">
                Forum Diskusi
              </Link>
              <Link to="/doctor-appointments" className="hover:text-gray-200">
                Reservasi
              </Link>
            </nav>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              {/* Logout*/}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-white text-[#7A0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Keluar
              </button>
            </div>
          </header>

          {/* Detail Artikel*/}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
              <button onClick={() => navigate(-1)} className="text-[#a71930] font-semibold mb-4 flex items-center gap-2">
                ‹ Kembali
              </button>
              <div className="w-full overflow-hidden rounded-2xl">
                <img
                  src={selected.gambar_url || "/article-placeholder.jpg"}
                  alt={selected.judul}
                  className="w-full max-h-[380px] object-cover"
                />
              </div>
              <div className="mt-6 text-4xl font-bold">{selected.judul}</div>
              <div className="mt-4 text-gray-800 whitespace-pre-line leading-relaxed">
                {selected.konten}
              </div>

              {/* EDIT FORM */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={submitUpdate} className="space-y-3">
                  <div className="text-xl font-semibold">Edit Artikel</div>

                  <input
                    className="w-full border rounded-xl p-3"
                    placeholder="Judul"
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    required
                  />

                  <textarea
                    className="w-full border rounded-xl p-3 h-40"
                    placeholder="Konten"
                    value={form.konten}
                    onChange={(e) => setForm({ ...form, konten: e.target.value })}
                    required
                  />

                  <input
                    className="w-full border rounded-xl p-3"
                    placeholder="Gambar URL"
                    value={form.gambar_url}
                    onChange={(e) => setForm({ ...form, gambar_url: e.target.value })}
                  />

                  <select
                    className="w-full border rounded-xl p-3"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  >
                    {kategoriList.filter(k => k.value !== "semua").map(kategori => (
                      <option key={kategori.value} value={kategori.value}>
                        {kategori.label}
                      </option>
                    ))}
                  </select>

                  <input
                    className="w-full border rounded-xl p-3"
                    placeholder="Tags (pisahkan dengan koma)"
                    value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#a71930] text-white px-5 py-3 rounded-xl hover:bg-[#8c1526]"
                    >
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>

                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={loading}
                      className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700"
                    >
                      Hapus Artikel
                    </button>
                  </div>
                </form>

                {error && <div className="text-red-600 text-sm">{error}</div>}
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
              <p className="mb-6">Yakin ingin menghapus artikel ini?</p>

              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  {loading ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}

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
      {/* OVERLAY GELAP */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* KONTEN  */}
      <div className="relative z-10">
        {/*HEADER */}
        <header className="bg-[#7A0C0C] text-white h-20 flex items-center justify-between px-6 shadow-lg">
          {/*Profil*/}
          <Link to="/doctor-profile" className="flex items-center gap-3 no-underline">
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a71930] to-[#8b1428] flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:opacity-90 transition-opacity"
              style={{ border: 'none' }}
            >
              {getInitial()}
            </div>
          </Link>

          {/* MENU */}
          <nav className="flex gap-8 font-medium">
            <Link to="/beranda-doctor" className="hover:text-gray-200">
              Beranda
            </Link>
            <Link to="/artikel/doctor" className="text-yellow-300 underline font-semibold">
              Artikel Kesehatan
            </Link>
            <Link to="/doctor/forum" className="hover:text-gray-200">
              Forum Diskusi
            </Link>
            <Link to="/doctor-appointments" className="hover:text-gray-200">
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

        {/* Articles Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-4xl flex flex-col"
            style={{ height: "80vh", maxHeight: 700, minHeight: 400 }}
          >
            {/* Header*/}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-2xl cursor-pointer"
              >
                <span>‹</span>
                <span className="text-lg font-medium">Kembali</span>
              </button>
              <div className="flex items-center gap-4">
                <div className="text-xl font-semibold">Filter Kategori:</div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-2 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#a71930]"
                >
                  {kategoriList.map(kategori => (
                    <option key={kategori.value} value={kategori.value}>
                      {kategori.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#a71930] text-white px-4 py-2 rounded-xl hover:bg-[#8b1428] font-semibold"
              >
                Tambah Artikel
              </button>
            </div>

            {/* Muat Ulang */}
            <div className="flex justify-end mb-6">
              <button
                onClick={loadList}
                className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium"
              >
                Muat Ulang Artikel
              </button>
            </div>

            {error && (
              <div className="text-red-600 mb-4 bg-red-100 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="mb-4 text-gray-600">
              Menampilkan {filteredArticles.length} artikel 
              {selectedCategory !== "semua" && ` dalam kategori "${kategoriList.find(k => k.value === selectedCategory)?.label}"`}
            </div>

            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {loading ? (
                <div className="text-center py-20">Loading...</div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  {selectedCategory === "semua" 
                    ? "Tidak ada artikel ditemukan" 
                    : `Tidak ada artikel dalam kategori "${kategoriList.find(k => k.value === selectedCategory)?.label}"`}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((a) => (
                  <Card key={a.id} item={a} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Create */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-semibold">Tambah Artikel</div>
              <button onClick={() => setShowForm(false)} className="text-gray-600 text-xl">
                ×
              </button>
            </div>

            <form onSubmit={submitCreate} className="space-y-3">
              <input
                className="w-full border rounded-xl p-3"
                placeholder="Judul"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
              />

              <textarea
                className="w-full border rounded-xl p-3 h-40"
                placeholder="Konten"
                value={form.konten}
                onChange={(e) => setForm({ ...form, konten: e.target.value })}
                required
              />

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Gambar URL"
                value={form.gambar_url}
                onChange={(e) => setForm({ ...form, gambar_url: e.target.value })}
              />

              <select
                className="w-full border rounded-xl p-3"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                {kategoriList.filter(k => k.value !== "semua").map(kategori => (
                  <option key={kategori.value} value={kategori.value}>
                    {kategori.label}
                  </option>
                ))}
              </select>

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Tags (pisahkan dengan koma)"
                value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#a71930] text-white rounded-xl"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

              {error && (
                <div className="text-red-600 p-3 bg-red-50 rounded-xl mt-4">{error}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/*MODAL KONFIRMASI LOGOUT */}
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

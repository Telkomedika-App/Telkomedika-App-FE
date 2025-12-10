import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createArtikel, deleteArtikel, getArtikel, listPublicArticles, updateArtikel } from "../../api/artikel";

export default function DoctorArtikel() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    konten: "",
    kategori: "umum",
    gambar_url: "",
    tags: []
  });

  const headerTitle = useMemo(() => {
    if (id) return selected?.judul || "Detail Artikel";
    return "Artikel Kesehatan";
  }, [id, selected]);

  // LOAD PUBLIC ARTICLES ONLY
  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listPublicArticles(q ? { search: q } : {});
      setArticles(res?.data || []);
    } catch {
      setError("Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  // LOAD DETAIL
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

  // CREATE
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

  // UPDATE
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

  // DELETE
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

  // CARD COMPONENT
  const Card = ({ item }) => (
    <div
      className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer"
      onClick={() => navigate(`/artikel/doctor/${item.id}`)}
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={item.gambar_url || "/article-placeholder.jpg"}
          alt={item.judul}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/article-placeholder.jpg")}
        />
      </div>
      <div className="p-4">
        <div className="font-semibold text-lg">{item.judul}</div>
        <div className="text-gray-600 text-sm mt-2">{item.excerpt || ""}</div>
      </div>
    </div>
  );

  // ============================
  // DETAIL VIEW
  // ============================
  if (id && selected) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        {/* close by clicking outside */}
        <div
          className="fixed inset-0"
          onClick={() => navigate("/artikel/doctor")}
          style={{ zIndex: 1 }}
        ></div>

        <div
          className="relative z-10 bg-[#a71930] px-6 py-4 text-white flex items-center gap-3"
        >
          <button onClick={() => navigate(-1)} className="text-xl">‹</button>
          <div className="font-semibold">{headerTitle}</div>
        </div>

        <div className="relative z-10 flex-1 p-6">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6">
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
                  <option value="umum">Umum</option>
                  <option value="penyakit">Penyakit</option>
                  <option value="gaya-hidup">Gaya Hidup</option>
                  <option value="makanan-sehat">Makanan Sehat</option>
                  <option value="olahraga">Olahraga</option>
                  <option value="mental-health">Mental Health</option>
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
      </div>
    );
  }

  // ============================
  // LIST VIEW
  // ============================
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="bg-[#a71930] px-6 py-4 text-white flex justify-between items-center">
        <div className="font-semibold">{headerTitle}</div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-[#a71930] px-4 py-2 rounded-xl hover:bg-gray-100"
        >
          Tambah Artikel
        </button>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari artikel..."
              className="border rounded-xl p-2 w-64"
              onKeyDown={(e) => e.key === "Enter" && loadList()}
            />

            <button
              onClick={loadList}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              Muat Ulang
            </button>
          </div>

          {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-xl">{error}</div>}

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-8 w-8 inline-block border-b-2 border-[#a71930]"></div>
              <p className="mt-2 text-gray-600">Memuat artikel...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Tidak ada artikel ditemukan</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Card key={a.id} item={a} />
              ))}
            </div>
          )}
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
                <option value="umum">Umum</option>
                <option value="penyakit">Penyakit</option>
                <option value="gaya-hidup">Gaya Hidup</option>
                <option value="makanan-sehat">Makanan Sehat</option>
                <option value="olahraga">Olahraga</option>
                <option value="mental-health">Mental Health</option>
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
    </div>
  );
}

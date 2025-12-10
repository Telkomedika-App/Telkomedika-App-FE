import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getArtikel, listStudentArticles } from "../../api/artikel";

export default function StudentArtikel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");

  const headerTitle = useMemo(() => {
    if (id) return selected?.judul || "Detail Artikel";
    return "Artikel Kesehatan";
  }, [id, selected]);

  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listStudentArticles(q ? { search: q } : {});
      setArticles(res?.data || []);
    } catch (e) {
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
    } catch (e) {
      setError("Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail();
    } else {
      loadList();
    }
  }, [id]);

  const Card = ({ item }) => (
    <div className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer" onClick={() => navigate(`/artikel/student/${item.id}`)}>
      <div className="h-40 w-full overflow-hidden">
        <img src={item.gambar_url || "/article-placeholder.jpg"} alt={item.judul} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="font-semibold text-lg">{item.judul}</div>
        <div className="text-gray-600 text-sm mt-2">{item.excerpt || ""}</div>
      </div>
    </div>
  );

  if (id && selected) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/background.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="bg-[#a71930] px-6 py-4 text-white flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xl">‹</button>
          <div className="font-semibold">{headerTitle}</div>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6">
            <div className="w-full overflow-hidden rounded-2xl">
              <img src={selected.gambar_url || "/article-placeholder.jpg"} alt={selected.judul} className="w-full max-h-[380px] object-cover" />
            </div>
            <div className="mt-6 text-4xl font-bold">{selected.judul}</div>
            <div className="mt-4 text-gray-800 whitespace-pre-line leading-relaxed">{selected.konten}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/background.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <div className="bg-[#a71930] px-6 py-4 text-white flex justify-between items-center">
        <div className="font-semibold">{headerTitle}</div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari" className="border rounded-xl p-2 w-64" />
          <button onClick={loadList} className="px-4 py-2 rounded-xl bg-white text-[#a71930]">Cari</button>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((a) => (
                <Card key={a.id} item={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

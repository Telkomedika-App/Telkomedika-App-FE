import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPosts, createPost } from "../../api/forum";

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

export default function StudentForum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  // Load posts dari API
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
    load();
  }, []);

  // Handle create post
  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Judul dan konten harus diisi.");
      return;
    }

    setCreating(true);
    const res = await createPost(title.trim(), content.trim());

    if (res && res.success) {
      setShowModal(false);
      setTitle("");
      setContent("");
      await load();
    } else {
      alert(res?.message || "Gagal membuat postingan.");
    }

    setCreating(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center pb-24"
      style={{ backgroundImage: "url('http://localhost:3001/bgForum.png')" }}
    >
      {/* Header */}
      <div className="bg-red-900 h-16 flex items-center px-4 text-white">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 rounded-full p-2 hover:bg-red-800"
        >
          <span className="text-xl">‹</span>
        </button>
        <div className="text-2xl font-semibold">Forum Diskusi</div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
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
                <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                <div className="font-semibold">{p.author?.name || "Pengguna"}</div>
              </div>

              {/* Waktu dan jumlah komentar */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{timeAgo(p.created_at)}</span>
                <span>{p.comments?.length || 0} Komentar</span>
              </div>

              <div className="mt-2 text-gray-800 whitespace-pre-line">{p.content}</div>
            </div>
          ))}
        </div>

        {/* Tombol buat posting */}
        <div className="fixed left-0 right-0 bottom-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow flex items-center"
          >
            <span className="mr-2 text-xl">＋</span>
            Unggah
          </button>
        </div>
      </div>

      {/* Modal buat post */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[32rem] p-6 rounded-t-2xl sm:rounded-2xl">
            <div className="text-lg font-semibold mb-4">Buat Postingan</div>

            <input
              className="w-full border rounded-lg p-2 mb-3"
              placeholder="Judul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full border rounded-lg p-2 h-32 mb-4"
              placeholder="Tulis konten"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? "Mengunggah..." : "Unggah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

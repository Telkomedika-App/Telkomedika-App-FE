import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPosts, deletePost, deleteComment } from "../../api/forum";

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

export default function DoctorForum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Hapus postingan ini?")) return;
    const res = await deletePost(postId);
    if (res && res.success) load();
    else alert(res?.message || "Gagal menghapus postingan");
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Hapus komentar ini?")) return;
    const res = await deleteComment(commentId);
    if (res && res.success) load();
    else alert(res?.message || "Gagal menghapus komentar");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center pb-24"
      style={{ backgroundImage: "url('http://localhost:3001/bgForum.png')" }}
    >
      {/* Header */}
      <div className="bg-red-900 h-16 flex items-center px-4 text-white">
        <button onClick={() => navigate(-1)} className="mr-2 rounded-full p-2 hover:bg-red-800">
          <span className="text-xl">‹</span>
        </button>
        <div className="text-2xl font-semibold">Forum Diskusi (Doctor)</div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && <div className="text-center text-gray-500">Memuat...</div>}
        {error && <div className="text-center text-red-600">{error}</div>}

        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="border border-red-200 rounded-xl shadow-sm p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                  <div className="font-semibold">{p.author?.name || "Pengguna"}</div>
                </div>

                {/* Hapus post */}
                <button
                  onClick={() => handleDeletePost(p.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Hapus
                </button>
              </div>

              <div className="text-sm text-gray-500">{timeAgo(p.created_at)}</div>
              <div className="mt-2 text-gray-800 whitespace-pre-line">{p.content}</div>

              {/* Komentar */}
              <div className="mt-4 ml-8 space-y-2">
                {(p.comments || []).map((c) => (
                  <div key={c.id} className="border border-red-200 p-3 rounded-xl bg-white flex justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                        <div className="font-semibold">{c.author?.name || "Pengguna"}</div>
                      </div>
                      <div className="text-sm text-gray-500">{timeAgo(c.created_at)}</div>
                      <div className="mt-1 text-gray-800 whitespace-pre-line">{c.content}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

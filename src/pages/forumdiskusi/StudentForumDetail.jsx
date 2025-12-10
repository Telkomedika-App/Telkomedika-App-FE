import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, addComment } from "../../api/forum";

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

export default function StudentForumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    const res = await getPost(id);
    if (res && res.success) setPost(res.data);
    else setError(res?.message || "Gagal memuat postingan");

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const send = async () => {
    if (!comment) return;
    setSending(true);

    const res = await addComment(id, comment);
    if (res && res.success) {
      setComment("");
      await load();
    }

    setSending(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center pb-28"
      style={{ backgroundImage: "url('http://localhost:3001/bgForum.png')" }}
    >
      <div className="bg-red-900 h-16 flex items-center px-4 text-white">
        <button onClick={() => navigate(-1)} className="mr-2 rounded-full p-2 hover:bg-red-800">
          <span className="text-xl">‹</span>
        </button>
        <div className="text-2xl font-semibold">Forum Diskusi</div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && <div className="text-center text-gray-500">Memuat...</div>}
        {error && <div className="text-center text-red-600">{error}</div>}

        {post && (
          <div className="space-y-4">
            <div className="border border-red-200 rounded-xl shadow-sm p-4 bg-white">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                <div className="font-semibold">{post.author?.name || "Pengguna"}</div>
              </div>

              <div className="text-sm text-gray-500">{timeAgo(post.created_at)}</div>
              <div className="mt-2 text-gray-800 whitespace-pre-line">{post.content}</div>
            </div>

            {(post.comments || []).map((c) => (
              <div
                key={c.id}
                className="border border-red-200 rounded-xl shadow-sm p-3 ml-8 bg-white"
              >
                <div className="flex items-center mb-1">
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                  <div className="font-semibold">{c.author?.name || "Pengguna"}</div>
                </div>

                <div className="text-sm text-gray-500">{timeAgo(c.created_at)}</div>
                <div className="mt-1 text-gray-800 whitespace-pre-line">{c.content}</div>
              </div>
            ))}

            <div className="fixed left-0 right-0 bottom-0 bg-white border-t p-3">
              <div className="max-w-3xl mx-auto flex items-center">
                <input
                  className="flex-1 border rounded-full px-4 py-2 mr-2"
                  placeholder="Tuliskan komentar anda"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button
                  onClick={send}
                  disabled={sending}
                  className="rounded-full bg-red-900 text-white px-4 py-2"
                >
                  {sending ? "Mengirim..." : "➤"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

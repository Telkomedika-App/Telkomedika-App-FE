import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/forum";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return "";
}

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [commentContent, setCommentContent] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${getCookie("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPosts(data.data || []));
  }, []);

  const handlePostChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("accessToken")}`,
      },
      body: JSON.stringify(newPost),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts([data.data, ...posts]);
      setNewPost({ title: "", content: "" });
    } else {
      setError(data.message || "Failed to create post");
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentContent({ ...commentContent, [postId]: value });
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("accessToken")}`,
      },
      body: JSON.stringify({ content: commentContent[postId] }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), data.data] }
            : post
        )
      );
      setCommentContent({ ...commentContent, [postId]: "" });
    } else {
      setError(data.message || "Failed to add comment");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Forum Discussion</h1>
      <form
        onSubmit={handleCreatePost}
        className="bg-white p-4 rounded shadow mb-8 space-y-2"
      >
        <h2 className="text-xl font-semibold mb-2">Create New Post</h2>
        <input
          name="title"
          value={newPost.title}
          onChange={handlePostChange}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <textarea
          name="content"
          value={newPost.content}
          onChange={handlePostChange}
          placeholder="Content"
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Post
        </button>
        {error && <div className="text-red-600">{error}</div>}
      </form>

      <div className="space-y-6">
            {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="mb-2">{post.content}</p>
                <div className="text-sm text-gray-500 mb-2">
                By {post.author?.name || "Unknown"} on{" "}
                {new Date(post.created_at).toLocaleString()}
                </div>
                <div className="ml-4">
                <h4 className="font-semibold mb-1">Comments:</h4>
                <ul className="mb-2">
                    {(post.comments || []).map((comment) => (
                    <li key={comment.id} className="border-b py-1">
                        <span className="font-medium">{comment.author?.name || "Unknown"}:</span>{" "}
                        {comment.content}
                    </li>
                    ))}
                </ul>
              <form
                onSubmit={(e) => handleAddComment(e, post.id)}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={commentContent[post.id] || ""}
                  onChange={(e) =>
                    handleCommentChange(post.id, e.target.value)
                  }
                  placeholder="Add a comment..."
                  className="flex-1 border px-2 py-1 rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
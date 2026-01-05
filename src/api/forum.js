import { fetchAPI } from "./client";
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from "../utils/constants";

function getToken() {
  return (
    localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

export async function listPosts() {
  const token = getToken();
  return fetchAPI(API_ENDPOINTS.FORUM, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getPost(id) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.FORUM}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPost(title, content) {
  const token = getToken();
  return fetchAPI(API_ENDPOINTS.FORUM, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title, content }),
  });
}


export async function addComment(id, content) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.FORUM}/${id}/comments`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"    // <-- FIX PENTING
    },
    body: JSON.stringify({ content }),
  });

  
}
export async function deletePost(id) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.FORUM}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function deleteComment(commentId) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.FORUM}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


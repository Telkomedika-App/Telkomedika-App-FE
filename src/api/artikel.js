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

export async function listPublicArticles(query = {}) {
  const params = new URLSearchParams(query).toString();
  const suffix = params ? `?${params}` : "";
  return fetchAPI(`${API_ENDPOINTS.ARTIKEL}${suffix}`);
}

export async function listStudentArticles(query = {}) {
  const token = getToken();
  const params = new URLSearchParams(query).toString();
  const suffix = params ? `?${params}` : "";
  return fetchAPI(`${API_ENDPOINTS.STUDENT_ARTIKEL}${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listDoctorArticles() {
  const token = getToken();
  return fetchAPI(API_ENDPOINTS.DOCTOR_MY_ARTIKEL, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getArtikel(id) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.ARTIKEL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function createArtikel(payload) {
  const token = getToken();
  return fetchAPI(API_ENDPOINTS.DOCTOR_ARTIKEL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateArtikel(id, payload) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.DOCTOR_ARTIKEL}/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteArtikel(id) {
  const token = getToken();
  return fetchAPI(`${API_ENDPOINTS.DOCTOR_ARTIKEL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

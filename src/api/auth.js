import { fetchAPI } from "./client";
import { AUTH_ENDPOINTS } from "../utils/constants";

export async function studentLogin(email, password) {
  return fetchAPI(AUTH_ENDPOINTS.STUDENT_LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function studentRegister(name, email, password, password_confirmation, phone) {
  return fetchAPI(AUTH_ENDPOINTS.STUDENT_REGISTER, {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation, phone }),
  });
}

export async function doctorLogin(email, password) {
  return fetchAPI(AUTH_ENDPOINTS.DOCTOR_LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function doctorRegister(name, email, password, password_confirmation, phone) {
  return fetchAPI(AUTH_ENDPOINTS.DOCTOR_REGISTER, {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation, phone }),
  });
}
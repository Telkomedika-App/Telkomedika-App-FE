import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorLogin } from "../api/auth";
import { ROUTES, ERROR_MESSAGES, LOCAL_STORAGE_KEYS } from "../utils/constants";
import useFormValidation from "./useFormValidation";
import { fetchAPI } from "../api/client";
import { jwtDecode } from "jwt-decode";

export default function useDoctorLogin() {
  const { form, error, setError, handleChange } = useFormValidation({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await doctorLogin(form.email, form.password);

      if (data.data && data.data.accessToken) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, data.data.accessToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_TYPE, "doctor");
        try {
          const decoded = jwtDecode(data.data.accessToken);
          const nameFromToken = decoded?.name || decoded?.fullName || decoded?.username || "";
          if (nameFromToken) {
            localStorage.setItem("doctorName", nameFromToken);
          }
        } catch (_) {}
        try {
          const profile = await fetchAPI("/doctor-profile", {
            method: "GET",
            headers: { Authorization: `Bearer ${data.data.accessToken}` },
          });
          if (profile?.success && profile?.data) {
            const name = profile.data.name || profile.data.fullName || "";
            if (name) {
              localStorage.setItem("doctorName", name);
            }
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(profile.data));
          }
        } catch (_) {}
        navigate(ROUTES.BERANDA_DOCTOR);
      } else {
        setError(data.message || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    error,
    setError,
    loading,
    handleChange,
    handleLogin,
  };
}

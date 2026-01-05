import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentLogin } from "../api/auth";
import { fetchAPI } from "../api/client";
import { jwtDecode } from "jwt-decode";
import { ROUTES, ERROR_MESSAGES, LOCAL_STORAGE_KEYS } from "../utils/constants";
import useFormValidation from "./useFormValidation";

export default function useStudentLogin() {
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
      const result = await studentLogin(form.email, form.password);

      if (result.data && result.data.accessToken) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, result.data.accessToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_TYPE, "student");
        try {
          const decoded = jwtDecode(result.data.accessToken);
          const nameFromToken = decoded?.name || decoded?.fullName || decoded?.username || "";
          if (nameFromToken) {
            localStorage.setItem("studentName", nameFromToken);
          }
        } catch (_) {}
        try {
          const profile = await fetchAPI("/student-profile", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${result.data.accessToken}`,
            },
          });
          if (profile?.success && profile?.data) {
            const name = profile.data.name || profile.data.fullName || "";
            if (name) {
              localStorage.setItem("studentName", name);
            }
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(profile.data));
          }
        } catch (_) {
        }
        navigate(ROUTES.BERANDA_STUDENT);
      } else {
        setError(result.message || ERROR_MESSAGES.LOGIN_FAILED);
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorLogin } from "../api/auth";
import { ROUTES, ERROR_MESSAGES, LOCAL_STORAGE_KEYS } from "../utils/constants";
import useFormValidation from "./useFormValidation";

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
        navigate(ROUTES.DOCTOR_APPOINTMENTS);
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentLogin } from "../api/auth";
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
        navigate(ROUTES.STUDENT_APPOINTMENTS);
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

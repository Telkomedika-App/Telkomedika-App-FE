import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentRegister } from "../api/auth";
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/constants";
import useFormValidation from "./useFormValidation";

export default function useRegisterForm() {
  const { form, error, setError, handleChange, resetForm } = useFormValidation({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
  });
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const data = await studentRegister(
      form.name,
      form.email,
      form.password,
      form.password_confirmation,
      form.phone
    );

    if (data.success) {
      setSuccess(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
      resetForm();
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    } else {
      setError(data.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    }
  };

  return {
    form,
    error,
    success,
    handleChange,
    handleSubmit,
  };
}
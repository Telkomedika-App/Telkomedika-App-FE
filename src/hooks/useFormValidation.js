import { useState } from "react";

export default function useFormValidation(initialState) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(initialState);
  };

  return {
    form,
    setForm,
    error,
    setError,
    handleChange,
    resetForm,
  };
}
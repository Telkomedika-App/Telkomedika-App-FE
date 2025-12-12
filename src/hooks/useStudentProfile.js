import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAPI } from "../api/client";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../utils/constants";

export default function useStudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    old_password: "",
    password: "",
    password_confirmation: "",
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

    if (!token || userType !== "student") {
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        const userType = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_TYPE);

        if (!token || userType !== "student") {
          setError("Unauthorized access");
          setLoading(false);
          return;
        }

        const response = await fetchAPI("/student-profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.success && response.data) {
          setStudent(response.data);
          setFormData((prev) => ({
            ...prev,
            name: response.data?.name || "",
            email: response.data?.email || "",
            phone: response.data?.phone || "",
          }));
        } else {
          setError(response.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditError(null);
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      
      // Build update data - only include non-empty fields or changed fields
      const updateData = {};
      
      // Always include these if they have values (even if unchanged, to be safe)
      if (formData.name && formData.name.trim()) {
        updateData.name = formData.name.trim();
      }
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      
      // Include password fields if password is being changed
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim();
        updateData.password_confirmation = formData.password_confirmation.trim();
        updateData.old_password = formData.old_password.trim();
      }

      console.log("Sending update data:", updateData);

      if (Object.keys(updateData).length === 0) {
        setEditError("Please enter at least one field to update");
        setIsSubmitting(false);
        return;
      }

      const response = await fetchAPI("/student-profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        setStudent(response.data);
        setFormData((prev) => ({
          ...prev,
          name: response.data?.name || "",
          email: response.data?.email || "",
          phone: response.data?.phone || "",
          old_password: "",
          password: "",
          password_confirmation: "",
        }));
        setEditSuccess("Profile updated successfully");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(null);
        }, 2000);
      } else {
        setEditError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setEditError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
    navigate(ROUTES.LOGIN);
  };

  const openEditModal = () => {
    setEditError(null);
    setEditSuccess(null);
    setFormData((prev) => ({
      ...prev,
      old_password: "",
      password: "",
      password_confirmation: "",
    }));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
    setEditSuccess(null);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return {
    student,
    loading,
    error,
    isEditModalOpen,
    isLogoutModalOpen,
    isSubmitting,
    editError,
    editSuccess,
    formData,
    handleInputChange,
    handleSaveProfile,
    handleLogout,
    openEditModal,
    closeEditModal,
    openLogoutModal,
    closeLogoutModal,
  };
}
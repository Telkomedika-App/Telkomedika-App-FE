import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";

const translations = {
  id: {
    title: "Reservasi",
    subtitle: "Silakan lengkapi data reservasi Anda",
    labelName: "Nama Lengkap",
    placeholderName: "Masukkan nama lengkap",
    labelPhone: "No. HP",
    placeholderPhone: "Contoh: 081234567890",
    labelDate: "Tanggal",
    labelTime: "Waktu",
    labelService: "Layanan",
    serviceGeneral: "Layanan Dokter Umum",
    serviceDental: "Layanan Dokter Gigi",
    submit: "Kirim Reservasi",
    logout: "Keluar",
    success: "Reservasi berhasil dikirim dan menunggu persetujuan admin",
    navHome: "Beranda",
    navArticles: "Artikel Kesehatan",
    navForum: "Forum Diskusi",
    navReservation: "Reservasi",
    errFill: "Harap lengkapi semua data",
    statusPending: "Menunggu Persetujuan Admin",
    statusConfirmed: "Reservasi Dikonfirmasi",
    statusCompleted: "Reservasi Selesai",
    statusCancelled: "Reservasi Dibatalkan",
    countdownLabel: "Menuju waktu reservasi:",
    cancelBtn: "Batalkan Reservasi",
    cancelConfirm: "Apakah Anda yakin ingin membatalkan reservasi? Permintaan pembatalan akan dikirim ke admin.",
    cancelSuccess: "Permintaan pembatalan telah dikirim ke admin",
    noReservation: "Tidak ada reservasi aktif",
    alreadyReservation: "Anda sudah memiliki reservasi aktif",
    appointmentCompleted: "Appointment sudah selesai",
    appointmentCancelled: "Appointment sudah dibatalkan",
  },
  en: {
    title: "Reservation",
    subtitle: "Please complete your reservation data",
    labelName: "Full Name",
    placeholderName: "Enter your full name",
    labelPhone: "Phone Number",
    placeholderPhone: "Example: 081234567890",
    labelDate: "Date",
    labelTime: "Time",
    labelService: "Service",
    serviceGeneral: "General Practitioner Service",
    serviceDental: "Dental Service",
    submit: "Submit Reservation",
    logout: "Logout",
    success: "Reservation submitted successfully and waiting for admin approval",
    navHome: "Home",
    navArticles: "Health Articles",
    navForum: "Discussion Forum",
    navReservation: "Reservation",
    errFill: "Please complete all fields",
    statusPending: "Waiting for Admin Approval",
    statusConfirmed: "Reservation Confirmed",
    statusCompleted: "Reservation Completed",
    statusCancelled: "Reservation Cancelled",
    countdownLabel: "Time until reservation:",
    cancelBtn: "Cancel Reservation",
    cancelConfirm: "Are you sure you want to cancel the reservation? Cancellation request will be sent to admin.",
    cancelSuccess: "Cancellation request has been sent to admin",
    noReservation: "No active reservation",
    alreadyReservation: "You already have an active reservation",
    appointmentCompleted: "Appointment completed",
    appointmentCancelled: "Appointment cancelled",
  },
};

export default function useStudentAppointment() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");

  const [lang, setLang] = useState("id");
  const [langPanelVisible, setLangPanelVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    service: "dokter-umum",
  });
  const [activeReservation, setActiveReservation] = useState(null);
  const [countdown, setCountdown] = useState("");

  // Set language attribute
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  // Utility: safe parse and select an "active" reservation
  const pickActiveReservationFromResponse = (data) => {
    if (!data) return null;

    if (!Array.isArray(data) && typeof data === "object") {
      const status = String(data.status || "").toUpperCase();
      if (["PENDING", "CONFIRMED"].includes(status)) {
        return data;
      }
      return null;
    }

    if (Array.isArray(data)) {
      const active = data
        .filter((a) => a && a.status)
        .sort((a, b) => {
          const ta = new Date(a.date).getTime() || 0;
          const tb = new Date(b.date).getTime() || 0;
          return tb - ta;
        })
        .find((a) => {
          const status = String(a.status).toUpperCase();
          return ["PENDING", "CONFIRMED"].includes(status);
        });

      return active || null;
    }

    return null;
  };

  const clearLocalActiveReservation = () => {
    localStorage.removeItem("activeReservation");
    setActiveReservation(null);
  };

  const fetchReservationData = async () => {
    if (!token) return;

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/my`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 7000,
      });

      const maybeData = res?.data?.data ?? res?.data;
      const picked = pickActiveReservationFromResponse(maybeData);

      if (!picked) {
        clearLocalActiveReservation();
        return;
      }

      let dateOnly = picked.date;
      if (typeof dateOnly === "string" && dateOnly.includes("T")) {
        dateOnly = dateOnly.split("T")[0];
      } else if (picked.date instanceof Date) {
        dateOnly = picked.date.toISOString().split("T")[0];
      }

      const normalized = { ...picked, date: dateOnly };
      const statusUpper = String(normalized.status || "").toUpperCase();

      if (["CANCELLED", "COMPLETED"].includes(statusUpper)) {
        clearLocalActiveReservation();
        return;
      }

      localStorage.setItem("activeReservation", JSON.stringify(normalized));
      setActiveReservation(normalized);
    } catch (err) {
      console.error("Error fetching reservation:", err);
      try {
        const saved = JSON.parse(localStorage.getItem("activeReservation") || "null");
        if (saved) {
          const savedStatus = String(saved.status || "").toUpperCase();
          if (!["CANCELLED", "COMPLETED"].includes(savedStatus)) {
            setActiveReservation(saved);
          }
        }
      } catch (e) {
        setActiveReservation(null);
      }
    }
  };

  // Load reservation on mount
  useEffect(() => {
    fetchReservationData();

    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("input-date");
    if (dateInput) dateInput.min = today;
  }, [token]);

  // Check if appointment time has passed
  useEffect(() => {
    if (!activeReservation) return;

    const interval = setInterval(() => {
      const statusUpper = String(activeReservation.status || "").toUpperCase();
      if (statusUpper === "CONFIRMED") {
        const now = new Date();
        const appointmentDate = activeReservation.date;
        const appointmentTime = activeReservation.time;

        if (appointmentDate && appointmentTime) {
          const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
          if (now > appointmentDateTime) {
            fetchReservationData();
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  // Countdown timer
  useEffect(() => {
    if (!activeReservation) {
      setCountdown("");
      return;
    }

    const statusUpper = String(activeReservation.status || "").toUpperCase();
    if (statusUpper !== "CONFIRMED") {
      setCountdown("");
      return;
    }

    const dateStr = activeReservation.date;
    const timeStr = activeReservation.time;

    if (!dateStr || !timeStr) {
      setCountdown("");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      let targetDateStr = dateStr;
      if (targetDateStr.includes("T")) {
        targetDateStr = targetDateStr.split("T")[0];
      }

      const target = new Date(`${targetDateStr}T${timeStr}`);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown("00:00:00");
        fetchReservationData();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) {
      alert(translations[lang].errFill);
      return;
    }

    if (activeReservation) {
      const statusUpper = String(activeReservation.status || "").toUpperCase();
      if (["PENDING", "CONFIRMED"].includes(statusUpper)) {
        alert(translations[lang].alreadyReservation);
        return;
      }
    }

    try {
      let serviceCode = form.service === "dokter-umum" ? "general" : "dental";

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}`,
        {
          fullName: form.name,
          phone: form.phone,
          date: form.date,
          time: form.time,
          service: serviceCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res?.data?.success) {
        alert(res?.data?.message || "Gagal membuat reservasi.");
        return;
      }

      const newData = res.data.data || {};
      const dateOnly =
        typeof newData.date === "string" && newData.date.includes("T")
          ? newData.date.split("T")[0]
          : newData.date || form.date;

      const newReservation = { ...newData, date: dateOnly };

      localStorage.setItem("activeReservation", JSON.stringify(newReservation));
      setActiveReservation(newReservation);

      setForm({
        name: "",
        phone: "",
        date: "",
        time: "",
        service: "dokter-umum",
      });

      alert(translations[lang].success);
    } catch (err) {
      console.error("Create appointment failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Gagal membuat reservasi.");
    }
  };

  const cancelReservation = async () => {
    if (!activeReservation) return;

    if (!window.confirm(translations[lang].cancelConfirm)) return;

    const id = activeReservation.id || activeReservation._id || null;

    if (id) {
      try {
        const url = `${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/${id}/cancel`;
        const res = await axios.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.success) {
          const updated = { ...activeReservation, status: "CANCELLED" };
          localStorage.setItem("activeReservation", JSON.stringify(updated));
          setActiveReservation(updated);
          alert(translations[lang].cancelSuccess);
        } else {
          alert(res?.data?.message || "Gagal membatalkan reservasi.");
        }
      } catch (err) {
        console.error("Cancel failed:", err);
        alert(err?.response?.data?.message || "Gagal membatalkan reservasi.");
      }
    } else {
      alert("ID appointment tidak ditemukan.");
    }
  };

  const toggleLangPanel = (e) => {
    e.stopPropagation();
    setLangPanelVisible(!langPanelVisible);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    setLangPanelVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setLangPanelVisible(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const serviceLabel = (svc) => {
    const safeSvc = String(svc || "").toLowerCase();
    if (safeSvc === "general" || safeSvc === "dokter-umum")
      return translations[lang].serviceGeneral;
    if (safeSvc === "dental" || safeSvc === "dokter-gigi")
      return translations[lang].serviceDental;
    return translations[lang].serviceGeneral;
  };

  const getStatusLabel = (status) => {
    const safeStatus = String(status || "").toUpperCase();
    if (safeStatus === "PENDING") return translations[lang].statusPending;
    if (safeStatus === "CONFIRMED") return translations[lang].statusConfirmed;
    if (safeStatus === "COMPLETED") return translations[lang].statusCompleted;
    if (safeStatus === "CANCELLED") return translations[lang].statusCancelled;
    return translations[lang].statusPending;
  };

  const isActiveReservation = () => {
    if (!activeReservation) return false;
    const statusUpper = String(activeReservation.status || "").toUpperCase();
    return ["PENDING", "CONFIRMED"].includes(statusUpper);
  };

  return {
    lang,
    setLang,
    langPanelVisible,
    toggleLangPanel,
    changeLanguage,
    form,
    setForm,
    activeReservation,
    countdown,
    translations,
    handleSubmit,
    cancelReservation,
    clearLocalActiveReservation,
    fetchReservationData,
    serviceLabel,
    getStatusLabel,
    isActiveReservation,
  };
}
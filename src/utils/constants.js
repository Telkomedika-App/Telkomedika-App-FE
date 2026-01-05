export const API_BASE_URL = "https://telkomedika-app-be-production.up.railway.app/api";
export const API_TIMEOUT = 5000;

export const USER_ROLES = {
  STUDENT: "student",
  DOCTOR: "doctor",
};

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  BERANDA_STUDENT: "/beranda-student",    
  BERANDA_DOCTOR: "/beranda-doctor",
  STUDENT_APPOINTMENTS: "/student-appointments",
  DOCTOR_APPOINTMENTS: "/doctor-appointments",
  FORUM: "/forum",
  STUDENT_ARTIKEL: "/artikel/student",
  DOCTOR_ARTIKEL: "/artikel/doctor",
};

export const AUTH_ENDPOINTS = {
  STUDENT_LOGIN: "/student-auth/login",
  STUDENT_REGISTER: "/student-auth/register",
  DOCTOR_LOGIN: "/doctor-auth/login",
  DOCTOR_REGISTER: "/doctor-auth/register",
};

export const API_ENDPOINTS = {
  APPOINTMENTS: "/appointments",
  STUDENT_APPOINTMENTS: "/appointments/student",
  DOCTOR_APPOINTMENTS: "/appointments/doctor",
  FORUM: "/forum",
  ARTIKEL: "/artikel",
  STUDENT_ARTIKEL: "/artikel/student/articles",
  DOCTOR_MY_ARTIKEL: "/artikel/doctor/my-articles",
  DOCTOR_ARTIKEL: "/artikel/doctor/articles",
  BERANDA_STUDENT: "/beranda-student",
  BERANDA_DOCTOR: "/beranda-doctor",
};

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[0-9]{10,12}$/,
  NAME_MIN_LENGTH: 3,
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  REQUIRED_FIELD: "This field is required",
  INVALID_PHONE: "Please enter a valid phone number",
  LOGIN_FAILED: "Invalid email or password",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTRATION_SUCCESS: "Registration successful!",
  APPOINTMENT_CREATED: "Appointment created successfully!",
  APPOINTMENT_CANCELLED: "Appointment cancelled successfully!",
  POST_CREATED: "Post created successfully!",
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_TYPE: "userType",
  USER_DATA: "userData",
  REFRESH_TOKEN: "refreshToken",
};

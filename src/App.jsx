import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentAppointment from "./pages/appointments/StudentAppointment";
import DoctorAppointment from "./pages/appointments/DoctorAppointment";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-appointments" element={<StudentAppointment />} />
        <Route path="/doctor-appointments" element={<DoctorAppointment />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
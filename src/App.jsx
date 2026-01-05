import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentAppointment from "./pages/appointments/StudentAppointment";
import DoctorAppointment from "./pages/appointments/DoctorAppointment";
import StudentForum from "./pages/forumdiskusi/StudentForum";
import StudentForumDetail from "./pages/forumdiskusi/StudentForumDetail";
import DoctorForum from "./pages/forumdiskusi/DoctorForum";
import BerandaStudent from "./pages/beranda/BerandaStudent";
import BerandaDoctor from "./pages/beranda/BerandaDoctor";
import DoctorArtikel from "./pages/artikel/DoctorArtikel";
import StudentArtikel from "./pages/artikel/StudentArtikel";
import StudentProfile from "./pages/StudentProfile";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorForumDetail from "./pages/forumdiskusi/DoctorForumDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-appointments" element={<StudentAppointment />} />
        <Route path="/doctor-appointments" element={<DoctorAppointment />} />
        <Route path="/forum" element={<StudentForum />} />
        <Route path="/forum/:id" element={<StudentForumDetail />} />
        <Route path="/forum-doctor" element={<DoctorForum />} />
        <Route path="/beranda-student" element={<BerandaStudent />} />
        <Route path="/beranda-doctor" element={<BerandaDoctor />} />
        <Route path="/artikel/doctor" element={<DoctorArtikel />} />
        <Route path="/artikel/doctor/:id" element={<DoctorArtikel />} />
        <Route path="/artikel/student" element={<StudentArtikel />} />
        <Route path="/artikel/student/:id" element={<StudentArtikel />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/doctor-profile" element={<DoctorProfile />} />
        <Route path="/doctor/forum" element={<DoctorForum />} />
        <Route path="/doctor/forum/:id" element={<DoctorForumDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

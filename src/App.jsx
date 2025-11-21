import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import Appointments from "./pages/Appointment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/appointment" element={<Appointments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;